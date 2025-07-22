import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface UserProfile {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  created_at: string;
}

export interface UserStats {
  postsShared: number;
  petsHelped: number;
  following: number;
  followers: number;
}

export const useProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: isLoadingProfile,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      // If user doesn't exist in users table, create them
      if (error && error.code === "PGRST116") {
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            name: "Alex Johnson",
            bio: "🐾 Passionate pet lover and advocate for animal welfare. Foster parent to 3 rescue dogs and 2 cats. Believer that every pet deserves a loving home! 🏠❤️",
            location: "San Francisco, CA",
            avatar_url:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newUser as any as UserProfile;
      }

      if (error) throw error;
      return data as any as UserProfile;
    },
    staleTime: 30000,
    retry: 1,
  });

  const { data: userStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user)
        return { postsShared: 0, petsHelped: 0, following: 0, followers: 0 };

      // Get posts count
      const { count: postsCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get pets helped count (pets that were adopted)
      const { count: petsHelped } = await supabase
        .from("pets")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("is_adopted", true);

      return {
        postsShared: postsCount || 0,
        petsHelped: petsHelped || 0,
        following: 0, // Placeholder - would need followers table
        followers: 0, // Placeholder - would need followers table
      } as UserStats;
    },
    enabled: !!profile,
  });

  const { data: userPosts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["user-posts"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          content,
          image_urls,
          created_at,
          likes:likes(id)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(9); // Limit to 9 for grid display

      if (error) throw error;

      return data.map((post) => ({
        id: post.id,
        image: post.image_urls?.[0] || null,
        caption: post.content,
        likes: post.likes?.length || 0,
      }));
    },
    enabled: !!profile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    userStats,
    userPosts,
    isLoading: isLoadingProfile || isLoadingStats || isLoadingPosts,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
