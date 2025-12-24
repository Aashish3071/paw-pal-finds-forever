import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { z } from "zod";

// Input validation schema
const careRequestSchema = z.object({
  pet_id: z.string().uuid("Invalid pet ID"),
  title: z.string().min(5, "Title is too short (min 5 characters)").max(200, "Title is too long (max 200 characters)"),
  description: z.string().max(2000, "Description is too long (max 2000 characters)").optional(),
  location: z.string().min(1, "Location is required").max(100, "Location is too long (max 100 characters)"),
  start_date: z.string(),
  end_date: z.string(),
  compensation: z.number().nonnegative("Compensation must be positive").optional(),
  compensation_type: z.string().optional(),
  instructions: z.string().max(1000, "Instructions are too long (max 1000 characters)").optional(),
});

export interface CareRequest {
  id: string;
  pet_id: string;
  owner_id: string;
  title: string;
  description?: string;
  location: string;
  start_date: string;
  end_date: string;
  compensation?: number;
  compensation_type?: string;
  instructions?: string;
  status: "open" | "assigned" | "completed" | "cancelled";
  assigned_caretaker_id?: string;
  created_at: string;
  updated_at: string;
  // Populated from join
  pet_name?: string;
  pet_type?: string;
  pet_image_url?: string;
  owner_name?: string;
  owner_avatar_url?: string;
  applications_count?: number;
}

export interface CreateCareRequestData {
  pet_id: string;
  title: string;
  description?: string;
  location: string;
  start_date: string;
  end_date: string;
  compensation?: number;
  compensation_type?: string;
  instructions?: string;
}

export const useCareRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all care requests with details
  const {
    data: careRequests = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["care-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_care_requests_with_details"
      );

      if (error) throw error;
      return (data || []) as CareRequest[];
    },
    staleTime: 30000,
    retry: 1,
  });

  // Get user's own care requests
  const { data: myCareRequests = [], isLoading: isLoadingMine } = useQuery({
    queryKey: ["my-care-requests"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("care_requests")
        .select(
          `
          *,
          pet:pets(name, type, image_urls),
          applications:care_applications(
            id,
            applicant_id,
            message,
            proposed_rate,
            status,
            created_at,
            applicant:users(name, avatar_url, bio, location)
          )
        `
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Create a new care request
  const createCareRequestMutation = useMutation({
    mutationFn: async (requestData: CreateCareRequestData) => {
      // Validate input
      const validated = careRequestSchema.parse(requestData);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("care_requests")
        .insert({
          pet_id: validated.pet_id,
          title: validated.title,
          description: validated.description,
          location: validated.location,
          start_date: validated.start_date,
          end_date: validated.end_date,
          compensation: validated.compensation,
          compensation_type: validated.compensation_type,
          instructions: validated.instructions,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-care-requests"] });
      toast({
        title: "Success!",
        description: "Your care request has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create care request.",
        variant: "destructive",
      });
    },
  });

  // Update care request status
  const updateCareRequestMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CareRequest>;
    }) => {
      const { data, error } = await supabase
        .from("care_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-care-requests"] });
      toast({
        title: "Success!",
        description: "Care request updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update care request.",
        variant: "destructive",
      });
    },
  });

  // Delete care request
  const deleteCareRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("care_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-care-requests"] });
      toast({
        title: "Success!",
        description: "Care request deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete care request.",
        variant: "destructive",
      });
    },
  });

  return {
    careRequests,
    myCareRequests,
    isLoading,
    isLoadingMine,
    error,
    createCareRequest: createCareRequestMutation.mutate,
    updateCareRequest: updateCareRequestMutation.mutate,
    deleteCareRequest: deleteCareRequestMutation.mutate,
    isCreating: createCareRequestMutation.isPending,
    isUpdating: updateCareRequestMutation.isPending,
    isDeleting: deleteCareRequestMutation.isPending,
  };
};
