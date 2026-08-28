import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localDb, LocalConversation, LocalMessage } from "@/lib/localDb";
import { useToast } from "./use-toast";

export type ConversationWithPet = LocalConversation;
export type Message = LocalMessage;

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
      return localDb.getConversations();
    },
    staleTime: 5000,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: CreateConversationData) => {
      const conv = localDb.createConversation(
        data.pet_id,
        data.owner_id,
        data.initial_message
      );
      return conv;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast({
        title: "Chat opened",
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
      return localDb.getMessages(conversationId);
    },
    enabled: !!conversationId,
    staleTime: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageData) => {
      return localDb.sendMessage(
        data.conversation_id,
        data.content,
        data.message_type,
        data.template_id
      );
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
      localDb.markMessagesAsRead(messageIds);
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
