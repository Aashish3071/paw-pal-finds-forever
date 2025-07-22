import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    name: string;
    avatar_url?: string;
  };
}

export interface CreateCommentData {
  post_id: string;
  content: string;
}

export const useComments = (postId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          user:users(name, avatar_url)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as Comment[];
    },
    enabled: !!postId,
    staleTime: 30000,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: comment, error } = await supabase
        .from("comments")
        .insert({
          post_id: data.post_id,
          user_id: user.id,
          content: data.content,
        })
        .select()
        .single();

      if (error) throw error;
      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // Update comment count
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment.",
        variant: "destructive",
      });
    },
  });

  return {
    comments,
    isLoading,
    error,
    createComment: createCommentMutation.mutate,
    isCreating: createCommentMutation.isPending,
  };
};
