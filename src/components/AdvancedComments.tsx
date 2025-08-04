import { useState, useMemo } from "react";
import {
  MessageCircle,
  Heart,
  Repeat2,
  Share,
  Pin,
  ChevronDown,
  MoreHorizontal,
  Reply,
  Smile,
  ThumbsUp,
  Angry,
  Laugh,
  Frown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComments } from "@/hooks/useComments";

interface AdvancedCommentsProps {
  postId: string;
  postOwnerId: string;
  isExpanded: boolean;
}

type SortOption = "top" | "recent" | "controversial";
type ReactionType = "like" | "love" | "laugh" | "angry" | "sad";

interface CommentReaction {
  type: ReactionType;
  count: number;
  userReacted: boolean;
}

interface EnhancedComment {
  id: string;
  content: string;
  user: {
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  parent_id?: string;
  reactions: CommentReaction[];
  replies: EnhancedComment[];
  isPinned: boolean;
  replyCount: number;
}

const reactionEmojis = {
  like: { icon: ThumbsUp, emoji: "👍" },
  love: { icon: Heart, emoji: "❤️" },
  laugh: { icon: Laugh, emoji: "😂" },
  angry: { icon: Angry, emoji: "😠" },
  sad: { icon: Frown, emoji: "😢" },
};

export function AdvancedComments({
  postId,
  postOwnerId,
  isExpanded,
}: AdvancedCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("top");
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(
    null
  );

  const { comments, isLoading, createComment, isCreating } =
    useComments(postId);

  // Enhanced comments with real data structure (no mock data)
  const enhancedComments: EnhancedComment[] = useMemo(() => {
    return comments.map((comment) => ({
      ...comment,
      parent_id: undefined,
      reactions: [],
      replies: [],
      isPinned: false,
      replyCount: 0,
    }));
  }, [comments]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    createComment({
      post_id: postId,
      content: newComment.trim(),
    });
    setNewComment("");
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return;
    // In real app: createReply({ parent_id: parentId, content: replyText.trim() });
    setReplyText("");
    setReplyingTo(null);
  };

  const handleReaction = (commentId: string, reactionType: ReactionType) => {
    // In real app: toggleCommentReaction(commentId, reactionType);
    setShowReactionPicker(null);
  };

  const handlePinComment = (commentId: string) => {
    // In real app: toggleCommentPin(commentId);
  };

  const sortedComments = useMemo(() => {
    let sorted = [...enhancedComments];

    switch (sortBy) {
      case "top":
        sorted.sort((a, b) => {
          const aTotal = a.reactions.reduce((sum, r) => sum + r.count, 0);
          const bTotal = b.reactions.reduce((sum, r) => sum + r.count, 0);
          return bTotal - aTotal;
        });
        break;
      case "recent":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "controversial":
        // Mock controversial sorting
        sorted.sort(() => Math.random() - 0.5);
        break;
    }

    // Pin comments at top
    return sorted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [enhancedComments, sortBy]);

  // Use sorted comments directly since search is removed
  const filteredComments = sortedComments;

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
      {/* Comments Header with Search and Sort */}
      <div className="px-4 py-2 border-b border-border/20 bg-background">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            Most relevant replies
            <svg
              className="w-3 h-3 text-muted-foreground"
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
          </h3>
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-20 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="controversial">Hot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Comments List - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-0 pb-24">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No comments yet</p>
              </div>
            ) : (
              filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`border-b border-border/20 px-4 py-3 hover:bg-muted/20 transition-colors ${
                    comment.isPinned
                      ? "bg-blue-50/50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
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
                        {comment.isPinned && (
                          <Pin className="w-4 h-4 text-blue-500" />
                        )}
                      </div>

                      <p className="text-sm text-foreground leading-relaxed mb-3">
                        {comment.content}
                      </p>

                      {/* Comment Reactions */}
                      <div className="flex items-center gap-1 mb-2">
                        {comment.reactions.map((reaction) => (
                          <button
                            key={reaction.type}
                            onClick={() =>
                              handleReaction(comment.id, reaction.type)
                            }
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                              reaction.userReacted
                                ? "bg-blue-100 text-blue-600"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <span>{reactionEmojis[reaction.type].emoji}</span>
                            <span>{reaction.count}</span>
                          </button>
                        ))}
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setReplyingTo(comment.id)}
                            className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors text-xs"
                          >
                            <Reply className="w-3 h-3" />
                            <span>Reply</span>
                          </button>

                          <div className="relative">
                            <button
                              onClick={() =>
                                setShowReactionPicker(
                                  showReactionPicker === comment.id
                                    ? null
                                    : comment.id
                                )
                              }
                              className="flex items-center gap-1 text-muted-foreground hover:text-yellow-500 transition-colors text-xs"
                            >
                              <Smile className="w-3 h-3" />
                              <span>React</span>
                            </button>

                            {showReactionPicker === comment.id && (
                              <div className="absolute bottom-6 left-0 bg-background border border-border rounded-lg shadow-lg p-2 flex gap-1 z-10">
                                {Object.entries(reactionEmojis).map(
                                  ([type, { emoji }]) => (
                                    <button
                                      key={type}
                                      onClick={() =>
                                        handleReaction(
                                          comment.id,
                                          type as ReactionType
                                        )
                                      }
                                      className="hover:bg-muted p-1 rounded text-lg"
                                    >
                                      {emoji}
                                    </button>
                                  )
                                )}
                              </div>
                            )}
                          </div>

                          {comment.replyCount > 0 && (
                            <button className="text-xs text-blue-500 hover:underline">
                              View {comment.replyCount} replies
                            </button>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handlePinComment(comment.id)}
                            >
                              <Pin className="w-4 h-4 mr-2" />
                              {comment.isPinned ? "Unpin" : "Pin"} comment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Report comment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 pl-4 border-l-2 border-border/30">
                          <div className="flex gap-2">
                            <Input
                              placeholder={`Reply to ${comment.user?.name}...`}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="flex-1 h-8 text-sm"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                !e.shiftKey &&
                                handleSubmitReply(comment.id)
                              }
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={!replyText.trim()}
                              className="h-8 px-3"
                            >
                              Reply
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReplyingTo(null)}
                              className="h-8 px-3"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
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
                  placeholder="Add a comment..."
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
                    "Post"
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
