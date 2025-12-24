import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { z } from "zod";

// Input validation schema
const commentSchema = z.object({
  post_id: z.string().uuid("Invalid post ID"),
  content: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long (max 2000 characters)"),
  parent_id: z.string().uuid("Invalid parent comment ID").optional(),
  reply_to_user_id: z.string().uuid("Invalid user ID").optional(),
});

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string;
  reply_to_user_id?: string;
  thread_level: number;
  thread_path: string;
  user: {
    name: string;
    avatar_url?: string;
  };
  reply_to_user?: {
    name: string;
    avatar_url?: string;
  };
  reply_count?: number;
}

export interface CreateCommentData {
  post_id: string;
  content: string;
  parent_id?: string;
  reply_to_user_id?: string;
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
          user:users!comments_user_id_fkey(name, avatar_url),
          reply_to_user:users!comments_reply_to_user_id_fkey(name, avatar_url)
        `
        )
        .eq("post_id", postId)
        .order("thread_path", { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as Comment[];
    },
    enabled: !!postId,
    staleTime: 30000,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentData) => {
      // Validate input
      const validated = commentSchema.parse(data);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Prepare insert data - include reply fields if they exist
      const insertData = {
        post_id: validated.post_id,
        user_id: user.id,
        content: validated.content,
        ...(validated.parent_id && { parent_id: validated.parent_id }),
        ...(validated.reply_to_user_id && { reply_to_user_id: validated.reply_to_user_id }),
      };

      const { data: comment, error } = await supabase
        .from("comments")
        .insert(insertData)
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
