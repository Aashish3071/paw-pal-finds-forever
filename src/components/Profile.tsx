import { Settings, Heart, MessageCircle, Share, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Profile() {
  const userStats = {
    postsShared: 15,
    petsHelped: 8,
    following: 42,
    followers: 38
  };

  const userPosts = [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300",
      caption: "Milo's first training session! 🎾",
      likes: 24
    },
    {
      id: "2", 
      image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=300",
      caption: "Sunny's afternoon nap 😸",
      likes: 31
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=300", 
      caption: "Beach day with Charlie! 🏖️",
      likes: 45
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-cream/30 to-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/20 z-10">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <Card className="border-border/20 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-20 w-20 ring-4 ring-primary-coral/20">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" alt="User" />
                <AvatarFallback>YU</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">Your Name</h2>
                <p className="text-muted-foreground">Pet lover • Mumbai</p>
                <Badge variant="secondary" className="mt-1">
                  🐾 Active Community Member
                </Badge>
              </div>
              
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
            
            <p className="text-foreground/80 mb-4">
              Passionate about animal welfare and connecting pets with loving families. 
              Dog parent to two rescues! 🐕❤️
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border/20">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{userStats.postsShared}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-primary-coral">{userStats.petsHelped}</p>
                <p className="text-xs text-muted-foreground">Pets Helped</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{userStats.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{userStats.followers}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/20 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3">
              <Heart className="w-4 h-4 text-primary-coral" />
              My Wishlist
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3">
              <MessageCircle className="w-4 h-4 text-sky-blue" />
              My Conversations
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3">
              <Share className="w-4 h-4 text-pet-orange" />
              Share PawPal
            </Button>
          </CardContent>
        </Card>

        {/* My Posts */}
        <Card className="border-border/20 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">My Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {userPosts.map((post) => (
                <div key={post.id} className="relative group cursor-pointer">
                  <img 
                    src={post.image} 
                    alt="User post"
                    className="w-full h-24 object-cover rounded-lg border border-border/20 group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Heart className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs">{post.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}