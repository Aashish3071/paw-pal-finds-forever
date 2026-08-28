import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localDb, LocalPet } from "@/lib/localDb";
import { useToast } from "./use-toast";

export type Pet = LocalPet;

export interface CreatePetData {
  name: string;
  type: string;
  breed: string;
  gender: "male" | "female" | string;
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
      return localDb.getPets();
    },
    staleTime: 5000,
  });

  const createPetMutation = useMutation({
    mutationFn: async (petData: CreatePetData) => {
      // Convert age string to number (extract years/months)
      let ageInMonths = 0;
      if (petData.age.includes("year")) {
        const years = parseInt(petData.age) || 1;
        ageInMonths = years * 12;
      } else if (petData.age.includes("month")) {
        ageInMonths = parseInt(petData.age) || 6;
      } else {
        ageInMonths = parseInt(petData.age) || 12;
      }

      const newPet = localDb.createPet({
        name: petData.name,
        type: petData.type.toLowerCase(),
        breed: petData.breed,
        gender: petData.gender.toLowerCase() === "female" ? "female" : "male",
        age: ageInMonths,
        description: petData.description,
        location: petData.location,
        image_urls: petData.image_urls || [],
      });

      return newPet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["my-pets"] });
      toast({
        title: "Ad Posted!",
        description: "Your pet listing is now live in the marketplace.",
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
      localDb.markPetAsAdopted(petId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["my-pets"] });
      toast({
        title: "Pet Adopted! 🎉",
        description: "Listing marked as adopted.",
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

  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      localDb.deletePet(petId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["my-pets"] });
      toast({
        title: "Listing deleted",
        description: "Your pet advertisement has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pet listing.",
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
    deletePet: deletePetMutation.mutate,
    isDeleting: deletePetMutation.isPending,
  };
};

// Hook to get user's own pets
export const useMyPets = () => {
  return useQuery({
    queryKey: ["my-pets"],
    queryFn: async () => {
      return localDb.getMyPets();
    },
    staleTime: 5000,
  });
};

export const useSavedPets = () => {
  const queryClient = useQueryClient();

  const { data: savedPets = [], isLoading } = useQuery({
    queryKey: ["saved-pets"],
    queryFn: async () => {
      return localDb.getSavedPets();
    },
  });

  const toggleSavedPet = useMutation({
    mutationFn: async (petId: string) => {
      return localDb.toggleSavedPet(petId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-pets"] });
    },
  });

  return {
    savedPets,
    isLoading,
    toggleSavedPet: toggleSavedPet.mutate,
    isUpdating: toggleSavedPet.isPending,
  };
};

