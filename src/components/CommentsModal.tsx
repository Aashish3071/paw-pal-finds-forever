import { useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useComments } from "@/hooks/useComments";

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postAuthor: string;
}

export function CommentsModal({
  isOpen,
  onClose,
  postId,
  postAuthor,
}: CommentsModalProps) {
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading, createComment, isCreating } =
    useComments(postId);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    createComment({
      post_id: postId,
      content: newComment.trim(),
    });
    setNewComment("");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "now";
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${Math.floor(diffDays / 7)}w`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[80vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-4 pb-2 border-b border-border/20">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                Comments
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Comments on {postAuthor}'s post
            </p>
          </DialogHeader>

          {/* Comments List */}
          <ScrollArea className="flex-1 p-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-24"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No comments yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to comment!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-muted rounded-2xl px-3 py-2">
                        <p className="font-medium text-sm text-foreground">
                          {comment.user?.name || "Anonymous"}
                        </p>
                        <p className="text-sm text-foreground mt-1 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-3">
                        {formatTimeAgo(comment.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Comment Input */}
          <div className="p-4 border-t border-border/20">
            <div className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmitComment()}
                className="flex-1"
                disabled={isCreating}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isCreating}
                size="icon"
                className="bg-primary-coral hover:bg-primary-coral/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
