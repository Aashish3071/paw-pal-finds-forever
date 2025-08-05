import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Repeat2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdvancedComments } from "./AdvancedComments";
import { Post } from "@/hooks/usePosts";
import { useFollows } from "@/hooks/useFollows";

interface PostDetailViewProps {
  post: Post;
  onBack: () => void;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onShare: (post: Post) => void;
  onFollow: (userId: string) => void;
  isLiking?: boolean;
  isReposting?: boolean;
}

export function PostDetailView({
  post,
  onBack,
  onLike,
  onRepost,
  onShare,
  onFollow,
  isLiking = false,
  isReposting = false,
}: PostDetailViewProps) {
  const { isFollowing } = useFollows();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Ensure the post view starts at the top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [post.id]); // Re-scroll when post changes

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return date.toLocaleDateString();
  };

  const formatFullTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    const time = date.toLocaleTimeString("en-US", timeOptions);
    const formattedDate = date.toLocaleDateString("en-US", dateOptions);

    return `${time} · ${formattedDate}`;
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
  };

  const handleRepostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRepost(post.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(post);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollow(post.user_id);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    // In real app: toggleBookmark(post.id);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/20">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="rounded-full hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Post</h1>
        </div>
      </div>

      {/* Post Content */}
      <div className="max-w-2xl mx-auto" id="post-content">
        <Card className="border-0 shadow-none">
          <CardContent className="p-6">
            {/* User Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-background shadow-md">
                  <AvatarImage src={post.user?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary-coral to-pet-orange text-white font-semibold">
                    {post.user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground hover:text-primary-coral transition-colors cursor-pointer">
                      {post.user?.name || "Anonymous"}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTimeAgo(post.created_at)}
                  </div>
                </div>
              </div>

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleFollowClick}>
                    {isFollowing(post.user_id) ? (
                      <>Unfollow {post.user?.name}</>
                    ) : (
                      <>Follow {post.user?.name}</>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Post Images */}
              {post.image_urls && post.image_urls.length > 0 && (
                <div className="mt-4 rounded-xl overflow-hidden">
                  <img
                    src={post.image_urls[0]}
                    alt="Post content"
                    className="w-full h-auto object-cover"
                    loading="eager"
                    onLoad={() => {
                      // Ensure scroll position remains at top after image loads
                      if (window.scrollY === 0) return;
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }}
                  />
                </div>
              )}
            </div>

            {/* Post Timestamp */}
            <div className="text-sm text-muted-foreground py-2">
              <span className="text-foreground">
                {formatFullTimestamp(post.created_at)}
              </span>
            </div>

            {/* Detailed Stats */}
            <div className="flex items-center gap-6 py-3 border-y border-border/20 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-bold text-foreground">
                  {post.reposts_count || 0}
                </span>
                <span className="text-muted-foreground">Reposts</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-foreground">
                  {post.comments_count || 0}
                </span>
                <span className="text-muted-foreground">Quotes</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-foreground">
                  {post.likes_count || 0}
                </span>
                <span className="text-muted-foreground">Likes</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-foreground">
                  {post.bookmarks_count || 0}
                </span>
                <span className="text-muted-foreground">Bookmarks</span>
              </div>
            </div>

            {/* Action Buttons - Twitter Style */}
            <div className="flex items-center justify-between py-2 px-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleLikeClick}
                disabled={isLiking}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-full text-muted-foreground hover:text-green-600 transition-colors"
                onClick={handleRepostClick}
                disabled={isReposting}
              >
                <Repeat2
                  className={`h-5 w-5 ${isReposting ? "animate-spin" : ""}`}
                />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 p-2 hover:bg-muted/50 rounded-full transition-colors ${
                  post.is_liked
                    ? "text-red-600"
                    : "text-muted-foreground hover:text-red-600"
                }`}
                onClick={handleLikeClick}
                disabled={isLiking}
              >
                <Heart
                  className={`h-5 w-5 ${post.is_liked ? "fill-current" : ""}`}
                />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 p-2 hover:bg-muted/50 rounded-full transition-colors ${
                  isBookmarked
                    ? "text-blue-500"
                    : "text-muted-foreground hover:text-blue-500"
                }`}
                onClick={handleBookmarkClick}
              >
                <svg
                  className="h-5 w-5"
                  fill={isBookmarked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleShareClick}
              >
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section - Twitter Style */}
        <div className="mt-4">
          <AdvancedComments
            postId={post.id}
            postOwnerId={post.user_id}
            isExpanded={true}
          />
        </div>
      </div>
    </div>
  );
}
