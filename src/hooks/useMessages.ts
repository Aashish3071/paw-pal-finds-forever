import { useState } from "react";

export interface Conversation {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  lastMessage: string;
  time: string;
  unreadCount: number;
  petName: string;
}

export const useMessages = () => {
  // For now, return empty array since we don't have real conversations yet
  // This will be expanded when we implement the full messaging system
  const [conversations] = useState<Conversation[]>([]);
  const isLoading = false;

  return {
    conversations,
    isLoading,
  };
};
