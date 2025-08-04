import { useState } from "react";
import { Settings, Heart, MessageCircle, Share, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/useProfile";
import { EditProfileModal } from "./EditProfileModal";
import { SettingsModal } from "./SettingsModal";

export function Profile() {
  const { profile, userStats, userPosts, isLoading } = useProfile();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/20 z-10">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/pet_logo_1.png"
                alt="PawPal Logo"
                className="h-8 w-auto mr-3 object-contain"
              />
              <h1 className="text-xl font-bold text-foreground">Profile</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Profile Header */}
        <Card className="border-border/20 shadow-card">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-16 w-16 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-muted rounded w-14"></div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-center space-y-1">
                      <div className="h-5 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary-coral/20">
                    <AvatarImage src={profile?.avatar_url} alt="Profile" />
                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary-coral/20 to-pet-orange/20 text-primary-coral">
                      {profile?.name?.charAt(0) || "🐾"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">
                      {profile?.name || "Your Name"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {profile?.location || "Add your location"}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                    className="h-8 px-3"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>

                {profile?.bio && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-border/10">
                  <div className="text-center">
                    <p className="text-base font-bold text-foreground">
                      {userStats?.postsShared || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-primary-coral">
                      {userStats?.petsHelped || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Helped</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-foreground">
                      {userStats?.following || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-foreground">
                      {userStats?.followers || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-3 hover:bg-primary-coral/5"
            onClick={() => console.log("Navigate to wishlist")}
          >
            <Heart className="w-5 h-5 text-primary-coral" />
            <span className="text-xs font-medium">Wishlist</span>
            <Badge variant="secondary" className="text-xs px-1 py-0">
              3
            </Badge>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-3 hover:bg-sky-blue/5"
            onClick={() => console.log("Navigate to messages")}
          >
            <MessageCircle className="w-5 h-5 text-sky-blue" />
            <span className="text-xs font-medium">Messages</span>
            <Badge variant="secondary" className="text-xs px-1 py-0">
              0
            </Badge>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-3 hover:bg-pet-orange/5"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "PawPal - Pet Adoption Platform",
                  text: "Find your perfect pet companion on PawPal!",
                  url: window.location.origin,
                });
              } else {
                navigator.clipboard.writeText(window.location.origin);
              }
            }}
          >
            <Share className="w-5 h-5 text-pet-orange" />
            <span className="text-xs font-medium">Share</span>
          </Button>
        </div>

        {/* My Posts */}
        <Card className="border-border/20 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">My Posts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-muted rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : userPosts && userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {userPosts.slice(0, 6).map((post) => (
                  <div key={post.id} className="relative group cursor-pointer">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt="Post"
                        className="aspect-square object-cover rounded-lg border border-border/20 group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-primary-coral/20 to-sky-blue/20 rounded-lg border border-border/20 flex items-center justify-center">
                        <div className="text-xl">🐾</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <Heart className="w-3 h-3 mx-auto mb-1" />
                        <span className="text-xs">{post.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm text-muted-foreground mb-1">
                  No posts yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Share your first pet moment!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}
