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
import { useComments, Comment } from "@/hooks/useComments";

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
  user_id: string;
  user: {
    name: string;
    avatar_url?: string;
  };
  reply_to_user?: {
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  parent_id?: string;
  reply_to_user_id?: string;
  thread_level: number;
  thread_path: string;
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

  // Advanced comment tree building with unlimited nesting
  const enhancedComments: EnhancedComment[] = useMemo(() => {
    console.log("Comments data:", comments); // Debug log

    // Check if advanced migration has been applied
    const hasThreading = comments.some(
      (comment) =>
        comment.thread_level !== undefined && comment.thread_path !== undefined
    );

    if (hasThreading) {
      console.log("Advanced threading detected, building tree structure");

      // Comments are already sorted by thread_path from the query
      // Transform flat list into tree structure
      return buildCommentTree(comments);
    } else {
      // Check if basic migration has been applied
      const hasBasicReplies = comments.some(
        (comment) => comment.parent_id !== undefined
      );

      if (hasBasicReplies) {
        console.log("Basic replies detected, building simple tree");
        return buildBasicTree(comments);
      } else {
        // Fallback: treat all as top-level
        console.log("No threading migration applied, showing flat structure");
        return comments.map((comment) => ({
          ...comment,
          user_id: comment.user_id,
          parent_id: comment.parent_id,
          reply_to_user_id: comment.reply_to_user_id,
          thread_level: comment.thread_level || 0,
          thread_path: comment.thread_path || "1",
          reactions: [],
          replies: [],
          isPinned: false,
          replyCount: 0,
        }));
      }
    }
  }, [comments]);

  // Build advanced comment tree with unlimited nesting
  const buildCommentTree = (flatComments: Comment[]): EnhancedComment[] => {
    const commentMap = new Map<string, EnhancedComment>();
    const rootComments: EnhancedComment[] = [];

    // First pass: create all comment objects
    flatComments.forEach((comment) => {
      const enhancedComment: EnhancedComment = {
        ...comment,
        thread_level: comment.thread_level || 0,
        thread_path: comment.thread_path || "1",
        reactions: [],
        replies: [],
        isPinned: false,
        replyCount: 0,
      };
      commentMap.set(comment.id, enhancedComment);
    });

    // Second pass: build tree structure
    flatComments.forEach((comment) => {
      const enhancedComment = commentMap.get(comment.id)!;

      if (!comment.parent_id) {
        // Top-level comment
        rootComments.push(enhancedComment);
      } else {
        // Reply - add to parent's replies array
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(enhancedComment);
          parent.replyCount = parent.replies.length;
        }
      }
    });

    return rootComments;
  };

  // Build basic tree (2-level nesting only)
  const buildBasicTree = (flatComments: Comment[]): EnhancedComment[] => {
    const topLevelComments = flatComments.filter(
      (comment) => !comment.parent_id
    );
    const replies = flatComments.filter((comment) => comment.parent_id);

    return topLevelComments.map((comment) => {
      const commentReplies = replies.filter(
        (reply) => reply.parent_id === comment.id
      );

      return {
        ...comment,
        thread_level: comment.thread_level || 0,
        thread_path: comment.thread_path || "1",
        reactions: [],
        replies: commentReplies.map((reply) => ({
          ...reply,
          thread_level: reply.thread_level || 1,
          thread_path: reply.thread_path || "1.1",
          reactions: [],
          replies: [],
          isPinned: false,
          replyCount: 0,
        })),
        isPinned: false,
        replyCount: commentReplies.length,
      };
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    createComment({
      post_id: postId,
      content: newComment.trim(),
    });
    setNewComment("");
  };

  const handleSubmitReply = (parentId: string, replyToUserId: string) => {
    if (!replyText.trim()) return;

    // Create reply comment (works with or without migration)
    createComment({
      post_id: postId,
      content: replyText.trim(), // Direct reply like Twitter, no @mention needed
      parent_id: parentId,
      reply_to_user_id: replyToUserId,
    });

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
      case "recent":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "top":
        sorted.sort((a, b) => {
          const aReactions = a.reactions.reduce(
            (sum, reaction) => sum + reaction.count,
            0
          );
          const bReactions = b.reactions.reduce(
            (sum, reaction) => sum + reaction.count,
            0
          );
          if (aReactions !== bReactions) return bReactions - aReactions;
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
        break;
      case "controversial":
        sorted.sort((a, b) => {
          const aControversy =
            (a.reactions.find((r) => r.type === "angry")?.count || 0) +
            (a.reactions.find((r) => r.type === "sad")?.count || 0);
          const bControversy =
            (b.reactions.find((r) => r.type === "angry")?.count || 0) +
            (b.reactions.find((r) => r.type === "sad")?.count || 0);
          return bControversy - aControversy;
        });
        break;
    }
    return sorted;
  }, [enhancedComments, sortBy]);

  // Use sorted comments directly since search is removed
  const filteredComments = sortedComments;

  // Get visual styling based on thread level
  const getThreadStyling = (level: number) => {
    const maxIndent = 60; // Maximum indentation in pixels
    const baseIndent = 20; // Base indentation per level
    const indent = Math.min(level * baseIndent, maxIndent);

    return {
      marginLeft: level > 0 ? `${indent}px` : "0px",
      borderLeft:
        level > 0
          ? `${level === 1 ? "2px" : "1px"} solid ${
              level === 1
                ? "hsl(var(--primary-coral))"
                : level === 2
                ? "hsl(var(--border))"
                : "hsl(var(--border) / 0.5)"
            }`
          : "none",
      paddingLeft: level > 0 ? "12px" : "0px",
    };
  };

  // Get avatar size based on thread level
  const getAvatarSize = (level: number) => {
    if (level === 0) return "w-10 h-10"; // Main comments
    if (level === 1) return "w-8 h-8"; // First level replies
    if (level === 2) return "w-7 h-7"; // Second level replies
    return "w-6 h-6"; // Deep replies (compact)
  };

  // Get font size based on thread level
  const getFontSizing = (level: number) => {
    if (level === 0) return "text-sm"; // Main comments
    if (level <= 2) return "text-sm"; // Normal replies
    return "text-xs"; // Deep replies (compact)
  };

  // Render individual comment with threading
  const renderComment = (comment: EnhancedComment): React.ReactNode => {
    const threadStyle = getThreadStyling(comment.thread_level);
    const avatarSize = getAvatarSize(comment.thread_level);
    const fontSize = getFontSizing(comment.thread_level);

    return (
      <div key={comment.id}>
        <div className="mb-4" style={threadStyle}>
          <div className="flex gap-3">
            <Avatar className={`${avatarSize} flex-shrink-0`}>
              <AvatarImage src={comment.user?.avatar_url} />
              <AvatarFallback
                className={`text-xs bg-muted text-foreground font-medium`}
              >
                {comment.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* User info and reply context */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-medium ${fontSize} text-foreground`}>
                  {comment.user?.name || "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(comment.created_at)}
                </span>
                {comment.reply_to_user && comment.thread_level > 0 && (
                  <span className="text-xs text-primary-coral">
                    replying to @{comment.reply_to_user.name}
                  </span>
                )}
              </div>

              {/* Comment content */}
              <div className={`${fontSize} text-foreground mb-2`}>
                {comment.content}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 ${fontSize} text-muted-foreground hover:text-primary-coral`}
                  onClick={() => setReplyingTo(comment.id)}
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>

                {comment.replyCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {comment.replyCount}{" "}
                    {comment.replyCount === 1 ? "reply" : "replies"}
                  </span>
                )}

                {/* More actions for main comments */}
                {comment.thread_level === 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handlePinComment(comment.id)}
                      >
                        <Pin className="w-3 h-3 mr-2" />
                        {comment.isPinned ? "Unpin" : "Pin"} comment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Report comment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-3 pl-4 border-l-2 border-border/30">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Post your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 h-8 text-sm"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        handleSubmitReply(comment.id, comment.user_id)
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        handleSubmitReply(comment.id, comment.user_id)
                      }
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

        {/* Render replies recursively */}
        {comment.replies && comment.replies.length > 0 && (
          <div>{comment.replies.map(renderComment)}</div>
        )}
      </div>
    );
  };

  if (!isExpanded) return null;

  return (
    <div className="bg-background flex flex-col h-screen">
      {/* Comments Header with Search and Sort */}
      <div className="px-4 py-2 border-b border-border/20 bg-background">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comments
            {comments.length > 0 && (
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                {comments.length}
              </span>
            )}
          </h3>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="controversial">Controversial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 pb-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-coral"></div>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredComments.map(renderComment)}
              </div>
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
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSubmitComment()
                }
                className="mb-2"
                disabled={isCreating}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isCreating}
                  size="sm"
                  className="bg-primary-coral hover:bg-primary-coral/90"
                >
                  {isCreating ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
