import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface CommentNotification {
  id: string;
  user_id: string;
  post_id: string;
  comment_id: string;
  type: "reply" | "mention" | "reaction";
  message: string;
  is_read: boolean;
  created_at: string;
  comment: {
    content: string;
    user: {
      name: string;
      avatar_url?: string;
    };
  };
  post: {
    content: string;
  };
}

export const useCommentNotifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comment-notifications"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // No mock data - return empty array until real notifications are implemented
      return [];
    },
    staleTime: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // In real app: mark notification as read in database
      console.log("Marking notification as read:", notificationId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment-notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // In real app: mark all notifications as read
      console.log("Marking all notifications as read");
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment-notifications"] });
      toast({
        title: "All notifications marked as read",
        description: "You're all caught up!",
      });
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
};
