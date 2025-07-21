import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface Post {
  id: string;
  content: string;
  image_urls: string[];
  created_at: string;
  user_id: string;
  user?: {
    name: string;
    avatar_url?: string;
    location?: string;
  };
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

export interface CreatePostData {
  content: string;
  image_urls?: string[];
  petType?: string;
}

export const usePosts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          user:users(name, avatar_url, location),
          likes:likes(user_id),
          comments:comments(id)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process the data to include counts and user like status
      const processedPosts = (data || []).map((post) => ({
        ...post,
        likes_count: post.likes?.length || 0,
        comments_count: post.comments?.length || 0,
        is_liked: user
          ? post.likes?.some((like: any) => like.user_id === user.id)
          : false,
      }));

      return processedPosts as Post[];
    },
    staleTime: 30000, // Cache for 30 seconds
    retry: 1, // Only retry once on failure
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: CreatePostData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("posts")
        .insert({
          content: postData.content,
          image_urls: postData.image_urls || [],
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Success!",
        description: "Your post has been shared with the community.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post.",
        variant: "destructive",
      });
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if already liked
      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);

        if (error) throw error;
        return false;
      } else {
        // Like
        const { error } = await supabase.from("likes").insert({
          user_id: user.id,
          post_id: postId,
        });

        if (error) throw error;
        return true;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update like.",
        variant: "destructive",
      });
    },
  });

  return {
    posts,
    isLoading,
    error,
    createPost: createPostMutation.mutate,
    isCreating: createPostMutation.isPending,
    toggleLike: toggleLikeMutation.mutate,
    isTogglingLike: toggleLikeMutation.isPending,
  };
};
