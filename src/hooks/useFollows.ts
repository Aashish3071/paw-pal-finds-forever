import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface FollowData {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export const useFollows = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get users that current user is following
  const { data: following = [], isLoading: isLoadingFollowing } = useQuery({
    queryKey: ["following"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (error) throw error;
      return data.map((f) => f.following_id);
    },
    staleTime: 30000,
  });

  // Check if current user is following a specific user
  const isFollowing = (userId: string) => {
    return following.includes(userId);
  };

  const toggleFollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const isCurrentlyFollowing = following.includes(userId);

      if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);

        if (error) throw error;
        return false;
      } else {
        // Follow
        const { error } = await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: userId,
        });

        if (error) throw error;
        return true;
      }
    },
    onSuccess: (isNowFollowing, userId) => {
      queryClient.invalidateQueries({ queryKey: ["following"] });

      // Get user name for toast (we'll need to enhance this)
      toast({
        title: isNowFollowing ? "Following!" : "Unfollowed",
        description: isNowFollowing
          ? "You are now following this user."
          : "You have unfollowed this user.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status.",
        variant: "destructive",
      });
    },
  });

  return {
    following,
    isLoadingFollowing,
    isFollowing,
    toggleFollow: toggleFollowMutation.mutate,
    isUpdating: toggleFollowMutation.isPending,
  };
};
