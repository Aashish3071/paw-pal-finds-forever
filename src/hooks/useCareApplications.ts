import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { z } from "zod";

// Input validation schema
const applicationSchema = z.object({
  request_id: z.string().uuid("Invalid request ID"),
  message: z.string().min(10, "Please provide more details (min 10 characters)").max(2000, "Message is too long (max 2000 characters)"),
  proposed_rate: z.number().nonnegative("Rate must be positive").optional(),
});

export interface CareApplication {
  id: string;
  request_id: string;
  applicant_id: string;
  message: string;
  proposed_rate?: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  // Populated from joins
  request?: {
    id: string;
    title: string;
    location: string;
    start_date: string;
    end_date: string;
    compensation?: number;
    compensation_type?: string;
    status: string;
    pet: {
      name: string;
      type: string;
      image_urls: string[];
    };
    owner: {
      name: string;
      avatar_url?: string;
    };
  };
  applicant?: {
    name: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
  };
}

export interface CreateCareApplicationData {
  request_id: string;
  message: string;
  proposed_rate?: number;
}

export const useCareApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get applications for a specific care request
  const useRequestApplications = (requestId: string) => {
    return useQuery({
      queryKey: ["care-applications", requestId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("care_applications")
          .select(
            `
            *,
            applicant:users(name, avatar_url, bio, location)
          `
          )
          .eq("request_id", requestId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return (data || []) as CareApplication[];
      },
      enabled: !!requestId,
      staleTime: 30000,
    });
  };

  // Get user's own applications
  const { data: myApplications = [], isLoading: isLoadingMine } = useQuery({
    queryKey: ["my-care-applications"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("care_applications")
        .select(
          `
          *,
          request:care_requests(
            id,
            title,
            location,
            start_date,
            end_date,
            compensation,
            compensation_type,
            status,
            pet:pets(name, type, image_urls),
            owner:users!care_requests_owner_id_fkey(name, avatar_url)
          )
        `
        )
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as CareApplication[];
    },
    staleTime: 30000,
  });

  // Create a new care application
  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: CreateCareApplicationData) => {
      // Validate input
      const validated = applicationSchema.parse(applicationData);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("care_applications")
        .insert({
          request_id: validated.request_id,
          message: validated.message,
          proposed_rate: validated.proposed_rate,
          applicant_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["care-applications", variables.request_id],
      });
      queryClient.invalidateQueries({ queryKey: ["my-care-applications"] });
      queryClient.invalidateQueries({ queryKey: ["care-requests"] });
      toast({
        title: "Success!",
        description: "Your application has been submitted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application.",
        variant: "destructive",
      });
    },
  });

  // Update application
  const updateApplicationMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CareApplication>;
    }) => {
      const { data, error } = await supabase
        .from("care_applications")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-care-applications"] });
      toast({
        title: "Success!",
        description: "Application updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application.",
        variant: "destructive",
      });
    },
  });

  // Approve application (for request owners)
  const approveApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { data, error } = await supabase.rpc("approve_care_application", {
        application_id: applicationId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-care-requests"] });
      queryClient.invalidateQueries({ queryKey: ["care-requests"] });
      toast({
        title: "Success!",
        description: "Application approved! The caretaker has been assigned.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve application.",
        variant: "destructive",
      });
    },
  });

  // Reject application
  const rejectApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { data, error } = await supabase
        .from("care_applications")
        .update({ status: "rejected" })
        .eq("id", applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-care-requests"] });
      toast({
        title: "Application rejected",
        description: "The application has been rejected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject application.",
        variant: "destructive",
      });
    },
  });

  // Delete application
  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("care_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-care-applications"] });
      queryClient.invalidateQueries({ queryKey: ["care-requests"] });
      toast({
        title: "Success!",
        description: "Application withdrawn successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw application.",
        variant: "destructive",
      });
    },
  });

  return {
    useRequestApplications,
    myApplications,
    isLoadingMine,
    createApplication: createApplicationMutation.mutate,
    updateApplication: updateApplicationMutation.mutate,
    approveApplication: approveApplicationMutation.mutate,
    rejectApplication: rejectApplicationMutation.mutate,
    deleteApplication: deleteApplicationMutation.mutate,
    isCreating: createApplicationMutation.isPending,
    isUpdating: updateApplicationMutation.isPending,
    isApproving: approveApplicationMutation.isPending,
    isRejecting: rejectApplicationMutation.isPending,
    isDeleting: deleteApplicationMutation.isPending,
  };
};
