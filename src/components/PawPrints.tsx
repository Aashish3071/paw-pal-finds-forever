import { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPostModal } from "./PawPostModal";

// Mock data for community posts
const mockPosts = [
  {
    id: "1",
    user: {
      name: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b830?w=150",
      location: "Mumbai"
    },
    content: "My little Milo learned a new trick today! 🎾 He can now catch the ball mid-air. So proud of my furry champion! #ProudPetParent",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500",
    petType: "Dog",
    likes: 24,
    comments: 8,
    timeAgo: "2h ago",
    isLiked: false
  },
  {
    id: "2", 
    user: {
      name: "Arjun Patel",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      location: "Bangalore"
    },
    content: "Sunny enjoying her afternoon nap in the garden. Cats really know how to live life! 😸 #CatLife #Peaceful",
    image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=500",
    petType: "Cat",
    likes: 31,
    comments: 12,
    timeAgo: "4h ago", 
    isLiked: true
  },
  {
    id: "3",
    user: {
      name: "Sneha Singh",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      location: "Delhi"
    },
    content: "Charlie's first beach experience! 🏖️ He was scared of the waves at first but now he's having the time of his life. Beach dog in the making! 🌊",
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=500",
    petType: "Dog",
    likes: 45,
    comments: 15,
    timeAgo: "6h ago",
    isLiked: false
  }
];

export function PawPrints() {
  const [posts, setPosts] = useState(mockPosts);
  const [showPostModal, setShowPostModal] = useState(false);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleNewPost = (postData: any) => {
    const newPost = {
      id: Date.now().toString(),
      user: {
        name: "You",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        location: "Your Location"
      },
      content: postData.content,
      image: postData.image || null,
      petType: postData.petType,
      likes: 0,
      comments: 0,
      timeAgo: "now",
      isLiked: false
    };
    
    setPosts(prev => [newPost, ...prev]);
  };

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
              <p className="text-sm text-muted-foreground">Community stories & moments</p>
            </div>
            <div className="text-2xl">🐾</div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {posts.map((post, index) => (
          <Card 
            key={post.id} 
            className="border-border/20 shadow-card animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-4">
              {/* User Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary-coral/20">
                    <AvatarImage src={post.user.avatar} alt={post.user.name} />
                    <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{post.user.name}</p>
                    <p className="text-xs text-muted-foreground">{post.user.location} • {post.timeAgo}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <p className="text-foreground mb-3 leading-relaxed">{post.content}</p>

              {/* Image */}
              {post.image && (
                <div className="mb-3 rounded-xl overflow-hidden">
                  <img 
                    src={post.image} 
                    alt="Pet post" 
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Pet Type Badge */}
              <div className="mb-3">
                <span className="inline-block bg-primary-coral/10 text-primary-coral text-xs font-medium px-2 py-1 rounded-full">
                  {post.petType}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-auto p-1 gap-2 ${post.isLiked ? 'text-primary-coral' : 'text-muted-foreground'}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current animate-heart-bounce' : ''}`} />
                    <span className="text-sm">{post.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-auto p-1 gap-2 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{post.comments}</span>
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowPostModal(true)}
        variant="hero"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-button-hover hover:shadow-lg transition-all duration-300 animate-pulse"
        size="icon"
      >
        <div className="relative">
          <div className="text-lg">🐾</div>
          <Plus className="absolute -top-1 -right-1 h-4 w-4 bg-white text-primary-coral rounded-full p-0.5" />
        </div>
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