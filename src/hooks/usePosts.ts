import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface Post {
  id: string;
  content: string;
  image_urls: string[];
  created_at: string;
  user_id: string;
  is_repost?: boolean;
  original_post_id?: string;
  repost_comment?: string;
  user?: {
    name: string;
    avatar_url?: string;
    location?: string;
  };
  original_post?: Post; // For reposts, contains the original post data
  likes_count?: number;
  comments_count?: number;
  reposts_count?: number;
  is_liked?: boolean;
  is_reposted?: boolean;
}

export interface CreatePostData {
  content: string;
  image_urls?: string[];
  petType?: string;
}

export interface CreateRepostData {
  original_post_id: string;
  repost_comment?: string;
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

  // Repost mutation
  const createRepostMutation = useMutation({
    mutationFn: async (data: CreateRepostData) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");

      // Create the repost entry
      const { error: repostError } = await supabase.from("reposts").insert({
        user_id: user.data.user.id,
        original_post_id: data.original_post_id,
        repost_comment: data.repost_comment,
      });

      if (repostError) throw repostError;

      // Create a new post entry for the repost
      const { error: postError } = await supabase.from("posts").insert({
        user_id: user.data.user.id,
        content: data.repost_comment || "", // The comment content
        is_repost: true,
        original_post_id: data.original_post_id,
        repost_comment: data.repost_comment,
      });

      if (postError) throw postError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Success!",
        description: "Post reposted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to repost.",
        variant: "destructive",
      });
    },
  });

  // Toggle repost mutation
  const toggleRepostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("Not authenticated");

      // Check if already reposted
      const { data: existingRepost } = await supabase
        .from("reposts")
        .select("id")
        .eq("user_id", user.data.user.id)
        .eq("original_post_id", postId)
        .single();

      if (existingRepost) {
        // Remove repost
        const { error } = await supabase
          .from("reposts")
          .delete()
          .eq("user_id", user.data.user.id)
          .eq("original_post_id", postId);

        if (error) throw error;
        return false;
      } else {
        // Create repost without comment
        const { error: repostError } = await supabase.from("reposts").insert({
          user_id: user.data.user.id,
          original_post_id: postId,
        });

        if (repostError) throw repostError;

        // Create post entry
        const { error: postError } = await supabase.from("posts").insert({
          user_id: user.data.user.id,
          content: "",
          is_repost: true,
          original_post_id: postId,
        });

        if (postError) throw postError;
        return true;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle repost.",
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
    createRepost: createRepostMutation.mutate,
    isReposting: createRepostMutation.isPending,
    toggleRepost: toggleRepostMutation.mutate,
    isTogglingRepost: toggleRepostMutation.isPending,
  };
};
