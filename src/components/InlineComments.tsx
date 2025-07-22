import { useState } from "react";
import { Send, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useComments } from "@/hooks/useComments";

interface InlineCommentsProps {
  postId: string;
  isExpanded: boolean;
}

export function InlineComments({ postId, isExpanded }: InlineCommentsProps) {
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

  if (!isExpanded) return null;

  return (
    <div className="border-t border-border/10 bg-gradient-to-b from-background/80 to-muted/20 backdrop-blur-sm">
      {/* Comments Section */}
      <div className="max-h-96 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 py-4 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-2 animate-pulse">
                    <div className="w-6 h-6 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-coral/20 to-pet-orange/20 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-primary-coral/60" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  No comments yet
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Be the first to start the conversation! 💬
                </p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className="group flex gap-3 hover:bg-gradient-to-r hover:from-muted/20 hover:to-primary-coral/5 -mx-2 px-3 py-2.5 rounded-xl transition-all duration-300 hover:shadow-sm border border-transparent hover:border-border/20 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Avatar className="w-9 h-9 mt-0.5 ring-2 ring-background shadow-md">
                    <AvatarImage src={comment.user?.avatar_url} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary-coral to-pet-orange text-white font-semibold">
                      {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-semibold text-sm text-foreground hover:text-primary-coral transition-colors cursor-pointer">
                        {comment.user?.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground/70 font-medium">
                        · {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed mb-2">
                      {comment.content}
                    </p>

                    {/* Comment Actions */}
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                        <Heart className="w-3 h-3" />
                        <span>0</span>
                      </button>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-coral transition-colors">
                        <MessageCircle className="w-3 h-3" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Comment Input */}
      <div className="p-4 border-t border-border/10 bg-gradient-to-r from-background to-muted/30">
        <div className="flex gap-3">
          <Avatar className="w-9 h-9 ring-2 ring-primary-coral/20 shadow-lg">
            <AvatarFallback className="text-xs bg-gradient-to-br from-primary-coral to-pet-orange text-white font-semibold">
              You
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Comment your reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSubmitComment()
                }
                className="flex-1 h-11 text-sm border-border/30 bg-background/50 backdrop-blur-sm placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary-coral/40 focus:border-primary-coral/50 rounded-full px-4 shadow-sm"
                disabled={isCreating}
              />
              {newComment.length > 0 && (
                <div className="absolute bottom-1 right-3 text-xs text-muted-foreground/60">
                  {newComment.length}/280
                </div>
              )}
            </div>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isCreating}
              size="sm"
              className={`h-11 px-6 rounded-full font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                newComment.trim()
                  ? "bg-gradient-to-r from-primary-coral to-pet-orange hover:from-primary-coral/90 hover:to-pet-orange/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Posting...</span>
                </div>
              ) : (
                "Reply"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
