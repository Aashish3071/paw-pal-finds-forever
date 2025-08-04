import { useState } from "react";
import { Send, MessageCircle, Heart, Repeat2, Share } from "lucide-react";
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
    <div className="bg-background flex flex-col h-screen">
      {/* Most relevant replies header */}
      <div className="px-4 py-3 border-b border-border/20 bg-background">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Most relevant replies
          </h3>
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Comments Section - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-0 pb-24">
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-muted-foreground/60" />
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
                  className="border-b border-border/20 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={comment.user?.avatar_url} />
                      <AvatarFallback className="text-xs bg-muted text-foreground font-medium">
                        {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">
                          {comment.user?.name || "Anonymous"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          @
                          {comment.user?.name
                            ?.toLowerCase()
                            .replace(/\s+/g, "") || "user"}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed mb-2">
                        {comment.content}
                      </p>

                      {/* Comment Actions - Twitter Style */}
                      <div className="flex items-center justify-between max-w-80">
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-500/10">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs">83</span>
                        </button>
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-green-500 transition-colors p-2 rounded-full hover:bg-green-500/10">
                          <Repeat2 className="w-4 h-4" />
                          <span className="text-xs">16</span>
                        </button>
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10">
                          <Heart className="w-4 h-4" />
                          <span className="text-xs">334</span>
                        </button>
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-500/10">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          <span className="text-xs">234K</span>
                        </button>
                        <button className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted/50">
                          <Share className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Comment Input - Fixed at Bottom */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-border/20 bg-background/95 backdrop-blur-sm z-50">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex gap-3">
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarFallback className="text-xs bg-muted text-foreground font-medium">
                You
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Post your reply"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSubmitComment()
                  }
                  className="flex-1 h-9 text-base bg-background border border-border/50 rounded-full px-4 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-muted-foreground/70 transition-all shadow-sm"
                  disabled={isCreating}
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isCreating}
                  size="sm"
                  className={`h-9 px-4 rounded-full font-semibold transition-all flex-shrink-0 ${
                    newComment.trim()
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-blue-500/50 text-white/70 cursor-not-allowed"
                  }`}
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Reply"
                  )}
                </Button>
              </div>
              {newComment.length > 0 && (
                <div className="mt-1 text-right">
                  <span className="text-xs text-muted-foreground">
                    {newComment.length}/280
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
