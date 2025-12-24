import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { z } from "zod";

// Input validation schemas
const createConversationSchema = z.object({
  pet_id: z.string().uuid("Invalid pet ID"),
  owner_id: z.string().uuid("Invalid owner ID"),
  initial_message: z.string().max(5000, "Message is too long (max 5000 characters)").optional(),
});

const sendMessageSchema = z.object({
  conversation_id: z.string().uuid("Invalid conversation ID"),
  content: z.string().min(1, "Message cannot be empty").max(5000, "Message is too long (max 5000 characters)"),
  message_type: z.string().optional(),
  template_id: z.string().optional(),
});

export interface ConversationWithPet {
  id: string;
  pet_id: string;
  adopter_id: string;
  owner_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  pet: {
    name: string;
    image_urls: string[];
    type: string;
  };
  other_user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  template_id?: string;
  created_at: string;
  read_at?: string;
  sender: {
    name: string;
    avatar_url?: string;
  };
}

export interface CreateConversationData {
  pet_id: string;
  owner_id: string;
  initial_message?: string;
}

export interface SendMessageData {
  conversation_id: string;
  content: string;
  message_type?: string;
  template_id?: string;
}

export const useConversations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          pet:pets(name, image_urls, type),
          adopter:users!conversations_adopter_id_fkey(id, name, avatar_url),
          owner:users!conversations_owner_id_fkey(id, name, avatar_url),
          messages:messages(
            content, created_at, sender_id,
            order: created_at.desc,
            limit: 1
          )
        `
        )
        .or(`adopter_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Process conversations to add other_user and unread_count
      const processedConversations = await Promise.all(
        (data || []).map(async (conv: any) => {
          const isAdopter = conv.adopter_id === user.id;
          const other_user = isAdopter ? conv.owner : conv.adopter;

          // Get unread message count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_id", user.id)
            .is("read_at", null);

          return {
            ...conv,
            other_user,
            last_message: conv.messages[0] || null,
            unread_count: unreadCount || 0,
          };
        })
      );

      return processedConversations as ConversationWithPet[];
    },
    staleTime: 30000,
    retry: 1,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: CreateConversationData) => {
      // Validate input
      const validated = createConversationSchema.parse(data);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("pet_id", validated.pet_id)
        .eq("adopter_id", user.id)
        .single();

      if (existingConv) {
        return existingConv;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          pet_id: validated.pet_id,
          adopter_id: user.id,
          owner_id: validated.owner_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Send initial message if provided
      if (validated.initial_message) {
        await supabase.from("messages").insert({
          conversation_id: newConv.id,
          sender_id: user.id,
          content: validated.initial_message,
        });
      }

      return newConv;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast({
        title: "Chat started!",
        description: "You can now message the pet owner.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation.",
        variant: "destructive",
      });
    },
  });

  return {
    conversations,
    isLoading,
    error,
    createConversation: createConversationMutation.mutate,
    isCreatingConversation: createConversationMutation.isPending,
  };
};

export const useMessages = (conversationId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:users(name, avatar_url)
        `
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!conversationId,
    staleTime: 10000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageData) => {
      // Validate input
      const validated = sendMessageSchema.parse(data);
      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: message, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: validated.conversation_id,
          sender_id: user.id,
          content: validated.content,
          message_type: validated.message_type || "text",
          template_id: validated.template_id,
        })
        .select()
        .single();

      if (error) throw error;
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", messageIds)
        .is("read_at", null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    markAsRead: markAsReadMutation.mutate,
  };
};

// Message templates for adopters and owners
export const MESSAGE_TEMPLATES = {
  adopter: [
    {
      button: "Still Available?",
      template: "Hi! Is {petName} still available for adoption?",
    },
    {
      button: "Health & Vaccines?",
      template:
        "Could you tell me about {petName}'s vaccination records or any health concerns?",
    },
    {
      button: "Meet & Greet",
      template:
        "I'd love to schedule a meet-and-greet. When would be convenient for you?",
    },
    {
      button: "General Interest",
      template:
        "Hi! I'm very interested in adopting {petName}. Could you tell me more about them?",
    },
    {
      button: "Experience",
      template:
        "Hi! I have experience with {petType}s and would love to give {petName} a loving home.",
    },
  ],
  owner: [
    {
      button: "Yes, Available",
      template: "Hi! Yes, {petName} is still looking for a home.",
    },
    {
      button: "Health Info",
      template:
        "{petName} is vaccinated and recently dewormed. I can share the vet booklet.",
    },
    {
      button: "Meet-up",
      template:
        "Sure! How about this weekend? What location works best for you?",
    },
    {
      button: "More Info",
      template:
        "Thank you for your interest in {petName}! I'd be happy to answer any questions.",
    },
    {
      button: "Appreciation",
      template:
        "Hello! I appreciate your interest. {petName} is a wonderful {petType}.",
    },
  ],
};
