import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Plus,
  UserPlus,
  UserMinus,
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
import { PawPostModal } from "./PawPostModal";
import { PostDetailView } from "./PostDetailView";
import { usePosts, Post } from "@/hooks/usePosts";
import { useFollows } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";

export function PawPrints() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const {
    posts,
    isLoading,
    createPost,
    toggleLike,
    toggleRepost,
    isTogglingRepost,
  } = usePosts();
  const { isFollowing, toggleFollow } = useFollows();
  const { toast } = useToast();

  const handleLike = (postId: string) => {
    toggleLike(postId);
  };

  const handleNewPost = (postData: {
    content: string;
    image?: string;
    petType?: string;
  }) => {
    createPost({
      content: postData.content,
      image_urls: postData.image ? [postData.image] : [],
      petType: postData.petType,
    });
    setShowPostModal(false);
  };

  const handlePostClick = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setSelectedPost(post);
    }
  };

  const handleCommentClick = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation(); // Prevent triggering post click
    // Comment button no longer expands - only post click opens detail view
  };

  const handleShareClick = (post: Post) => {
    if (navigator.share) {
      navigator.share({
        title: `${post.user?.name}'s post on PawPal`,
        text: post.content,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to clipboard.",
      });
    }
  };

  const handleFollowClick = (userId: string) => {
    toggleFollow(userId);
  };

  const handleRepostClick = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    toggleRepost(postId);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  // If a post is selected, show the detail view
  if (selectedPost) {
    return (
      <PostDetailView
        post={selectedPost}
        onBack={() => setSelectedPost(null)}
        onLike={handleLike}
        onRepost={(postId: string) =>
          handleRepostClick({} as React.MouseEvent, postId)
        }
        onShare={handleShareClick}
        onFollow={handleFollowClick}
        isLiking={false}
        isReposting={isTogglingRepost}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-cream/30 to-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/20 z-10">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-coral to-pet-orange bg-clip-text text-transparent">
                PawPrints
              </h1>
              <p className="text-sm text-muted-foreground">
                Community stories & moments
              </p>
            </div>
            <div className="text-2xl">🐾</div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/20 shadow-card">
                <CardContent className="p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 bg-muted rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                  <div className="h-48 bg-muted rounded mt-3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No posts yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share a pet moment!
            </p>
            <Button
              onClick={() => setShowPostModal(true)}
              className="bg-gradient-to-r from-primary-coral to-pet-orange text-white"
            >
              Share Your First Post
            </Button>
          </div>
        ) : (
          posts.map((post, index) => (
            <Card
              key={post.id}
              className="border-border/20 shadow-card animate-slide-up cursor-pointer hover:shadow-lg transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handlePostClick(post.id)}
            >
              <CardContent className="p-4">
                {/* User Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-primary-coral/20">
                      <AvatarImage
                        src={post.user?.avatar_url}
                        alt={post.user?.name}
                      />
                      <AvatarFallback>
                        {post.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {post.user?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {post.user?.location || "Unknown"} •{" "}
                        {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleFollowClick(post.user_id)}
                      >
                        {isFollowing(post.user_id) ? (
                          <>
                            <UserMinus className="w-4 h-4 mr-2" />
                            Unfollow {post.user?.name}
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Follow {post.user?.name}
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content */}
                <p className="text-foreground mb-3 leading-relaxed">
                  {post.content}
                </p>

                {/* Media */}
                {post.image_urls && post.image_urls.length > 0 && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <img
                      src={post.image_urls[0]}
                      alt="Pet post"
                      className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Actions */}
                <div
                  className="flex items-center justify-between pt-2 border-t border-border/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-auto p-1 gap-2 ${
                        post.is_liked
                          ? "text-primary-coral"
                          : "text-muted-foreground"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id);
                      }}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          post.is_liked
                            ? "fill-current animate-heart-bounce"
                            : ""
                        }`}
                      />
                      <span className="text-sm">{post.likes_count || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 gap-2 hover:text-primary-coral transition-colors text-muted-foreground"
                      onClick={(e) => handleCommentClick(e, post.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">
                        {post.comments_count || 0}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-auto p-1 gap-2 transition-colors ${
                        post.is_reposted
                          ? "text-green-600 hover:text-green-700"
                          : "text-muted-foreground hover:text-green-600"
                      }`}
                      onClick={(e) => handleRepostClick(e, post.id)}
                      disabled={isTogglingRepost}
                    >
                      <Repeat2
                        className={`h-4 w-4 ${
                          isTogglingRepost ? "animate-spin" : ""
                        }`}
                      />
                      <span className="text-sm">{post.reposts_count || 0}</span>
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-muted-foreground hover:text-primary-coral"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareClick(post);
                    }}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>

                {/* Comments removed - now handled by PostDetailView */}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowPostModal(true)}
        variant="hero"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-button-hover hover:shadow-lg transition-all duration-300"
        size="icon"
      >
        <div className="text-lg">🐾</div>
      </Button>

      {/* Post Modal */}
      <PawPostModal
        open={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPost={handleNewPost}
      />
    </div>
  );
}
