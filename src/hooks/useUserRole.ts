import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const {
    data: userRole,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { role: "adopter", hasPets: false, petCount: 0 };

      // Check if user has any pets listed
      const { data: pets, count } = await supabase
        .from("pets")
        .select("id", { count: "exact" })
        .eq("owner_id", user.id);

      const petCount = count || 0;
      const hasPets = petCount > 0;

      // Determine role based on whether they have pets
      // If they have pets, they're likely a pet owner/rehomer
      // If they don't have pets, they're likely an adopter
      const role = hasPets ? "owner" : "adopter";

      return {
        role: role as "adopter" | "owner",
        hasPets,
        petCount,
      };
    },
    staleTime: 60000, // Cache for 1 minute
    retry: 1,
  });

  return {
    userRole: userRole?.role || "adopter",
    hasPets: userRole?.hasPets || false,
    petCount: userRole?.petCount || 0,
    isLoading,
    error,
  };
};
