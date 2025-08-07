import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: number;
  description: string;
  image_urls: string[];
  location: string;
  is_adopted: boolean;
  created_at: string;
  owner_id: string;
  owner?: {
    name: string;
    avatar_url?: string;
  };
}

export interface CreatePetData {
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: string;
  description: string;
  location: string;
  image_urls?: string[];
}

export const usePets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: pets = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pets")
        .select(
          `
          *,
          owner:users(name, avatar_url)
        `
        )
        .eq("is_adopted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Pet[];
    },
    staleTime: 30000, // Cache for 30 seconds
    retry: 1, // Only retry once on failure
  });

  const createPetMutation = useMutation({
    mutationFn: async (petData: CreatePetData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Convert age string to number (extract years/months)
      let ageInMonths = 0;
      if (petData.age.includes("year")) {
        const years = parseInt(petData.age);
        ageInMonths = years * 12;
      } else if (petData.age.includes("month")) {
        ageInMonths = parseInt(petData.age);
      }

      const { data, error } = await supabase
        .from("pets")
        .insert({
          ...petData,
          age: ageInMonths,
          owner_id: user.id,
          image_urls: petData.image_urls || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      toast({
        title: "Success!",
        description: "Your pet listing has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create pet listing.",
        variant: "destructive",
      });
    },
  });

  const markAsAdoptedMutation = useMutation({
    mutationFn: async (petId: string) => {
      const { error } = await supabase
        .from("pets")
        .update({ is_adopted: true })
        .eq("id", petId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      toast({
        title: "Success!",
        description: "Pet has been marked as adopted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pet status.",
        variant: "destructive",
      });
    },
  });

  return {
    pets,
    isLoading,
    error,
    createPet: createPetMutation.mutate,
    isCreating: createPetMutation.isPending,
    markPetAsAdopted: markAsAdoptedMutation.mutate,
    isUpdatingStatus: markAsAdoptedMutation.isPending,
  };
};

// Hook to get user's own pets
export const useMyPets = () => {
  return useQuery({
    queryKey: ["my-pets"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Pet[];
    },
    staleTime: 30000,
    retry: 1,
  });
};

export const useSavedPets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedPets = [], isLoading } = useQuery({
    queryKey: ["saved-pets"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("saved_items")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("item_type", "pet");

      if (error) throw error;
      return data.map((item) => item.item_id);
    },
  });

  const toggleSavedPet = useMutation({
    mutationFn: async (petId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const isSaved = savedPets.includes(petId);

      if (isSaved) {
        const { error } = await supabase
          .from("saved_items")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", petId)
          .eq("item_type", "pet");

        if (error) throw error;
      } else {
        const { error } = await supabase.from("saved_items").insert({
          user_id: user.id,
          item_id: petId,
          item_type: "pet",
        });

        if (error) throw error;
      }

      return !isSaved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-pets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update saved pets.",
        variant: "destructive",
      });
    },
  });

  return {
    savedPets,
    isLoading,
    toggleSavedPet: toggleSavedPet.mutate,
    isUpdating: toggleSavedPet.isPending,
  };
};
