import { useState } from "react";
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
import { InlineComments } from "./InlineComments";
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

  return (
    <div className="min-h-screen bg-background">
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
      <div className="max-w-2xl mx-auto">
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
                    <span className="text-muted-foreground/70 text-sm">
                      {post.user?.location}
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
                  />
                </div>
              )}
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center gap-6 py-3 border-y border-border/20 text-sm text-muted-foreground">
              {post.likes_count > 0 && (
                <span>
                  <strong className="text-foreground">
                    {post.likes_count}
                  </strong>{" "}
                  Likes
                </span>
              )}
              {post.reposts_count > 0 && (
                <span>
                  <strong className="text-foreground">
                    {post.reposts_count}
                  </strong>{" "}
                  Reposts
                </span>
              )}
              {post.comments_count > 0 && (
                <span>
                  <strong className="text-foreground">
                    {post.comments_count}
                  </strong>{" "}
                  Comments
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-around py-3">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 px-4 py-2 hover:bg-red-50 hover:text-red-600 transition-colors ${
                  post.is_liked ? "text-red-600" : "text-muted-foreground"
                }`}
                onClick={handleLikeClick}
                disabled={isLiking}
              >
                <Heart
                  className={`h-5 w-5 ${post.is_liked ? "fill-current" : ""}`}
                />
                <span>Like</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors ${
                  post.is_reposted ? "text-green-600" : "text-muted-foreground"
                }`}
                onClick={handleRepostClick}
                disabled={isReposting}
              >
                <Repeat2
                  className={`h-5 w-5 ${isReposting ? "animate-spin" : ""}`}
                />
                <span>Repost</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors text-muted-foreground"
                onClick={handleShareClick}
              >
                <Share className="h-5 w-5" />
                <span>Share</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="border-t border-border/20">
          <InlineComments postId={post.id} isExpanded={true} />
        </div>
      </div>
    </div>
  );
}
