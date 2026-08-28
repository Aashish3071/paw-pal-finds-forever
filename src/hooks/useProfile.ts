import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localDb, LocalUser } from "@/lib/localDb";
import { useToast } from "./use-toast";

export type UserProfile = LocalUser;

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
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      return localDb.getProfile();
    },
    staleTime: 5000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      return localDb.updateProfile(updates);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved.",
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
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};

