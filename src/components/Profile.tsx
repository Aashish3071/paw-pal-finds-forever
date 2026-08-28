import { useState } from "react";
import {
  Settings,
  Heart,
  MessageCircle,
  Share,
  Edit,
  Plus,
  Trash2,
  CheckCircle2,
  MapPin,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { usePets, useMyPets, useSavedPets, Pet } from "@/hooks/usePets";
import { EditProfileModal } from "./EditProfileModal";
import { SettingsModal } from "./SettingsModal";
import { PetDetails } from "./PetDetails";

interface ProfileProps {
  onNavigateToMessages?: (conversationId?: string) => void;
  onCreateListing?: () => void;
}

export function Profile({
  onNavigateToMessages,
  onCreateListing,
}: ProfileProps = {}) {
  const { profile, isLoading: isProfileLoading } = useProfile();
  const { data: myPets = [], isLoading: isMyPetsLoading } = useMyPets();
  const { pets: allPets } = usePets();
  const { savedPets, toggleSavedPet } = useSavedPets();
  const { markPetAsAdopted, deletePet } = usePets();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Filter wishlisted pets from allPets
  const wishlistedPets = allPets.filter((p) => savedPets.includes(p.id));

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Header Card */}
        <Card className="border border-border/40 shadow-xs rounded-3xl overflow-hidden bg-card">
          <CardContent className="p-6 sm:p-8">
            {isProfileLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-40"></div>
                    <div className="h-3 bg-muted rounded w-28"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-primary-coral/10">
                      <AvatarImage src={profile?.avatar_url} alt="Profile" />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary-coral/20 to-pet-orange/20 text-primary-coral">
                        {profile?.name?.charAt(0) || "🐾"}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-foreground">
                        {profile?.name || "Pet Lover"}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-coral" />
                        <span>{profile?.location || "Mumbai, India"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditModal(true)}
                      className="h-9 px-4 rounded-xl border-border/50 text-xs font-bold"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-muted"
                      onClick={() => setShowSettingsModal(true)}
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                {profile?.bio && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed bg-muted/20 p-3.5 rounded-2xl border border-border/20">
                    {profile.bio}
                  </p>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/20">
                    <p className="text-lg font-black text-foreground">
                      {myPets.length}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">My Listings</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/20">
                    <p className="text-lg font-black text-primary-coral">
                      {wishlistedPets.length}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Saved Pets</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/20">
                    <p className="text-lg font-black text-emerald-600">
                      {myPets.filter((p) => p.is_adopted).length}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Rehomed</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listings & Favorites Tabs */}
        <Tabs defaultValue="my-listings" className="w-full space-y-4">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl h-12 bg-muted/50 p-1">
            <TabsTrigger value="my-listings" className="rounded-xl text-xs sm:text-sm font-bold">
              My Listed Pets ({myPets.length})
            </TabsTrigger>
            <TabsTrigger value="saved-pets" className="rounded-xl text-xs sm:text-sm font-bold">
              Saved Favorites ({wishlistedPets.length})
            </TabsTrigger>
          </TabsList>

          {/* My Listed Pets Tab */}
          <TabsContent value="my-listings" className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pets You Are Rehoming
              </h3>
              {onCreateListing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-bold rounded-xl border-primary-coral/40 text-primary-coral hover:bg-primary-coral/10 gap-1.5"
                  onClick={onCreateListing}
                >
                  <Plus className="w-3.5 h-3.5" />
                  List a Pet
                </Button>
              )}
            </div>

            {isMyPetsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-muted/40 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : myPets.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-border/50 bg-muted/20 space-y-3">
                <div className="text-5xl">🐶✨</div>
                <h4 className="font-bold text-base text-foreground">No pets listed yet</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Looking to rehome a pet? Create a free listing to connect with loving adopters.
                </p>
                {onCreateListing && (
                  <Button
                    size="sm"
                    className="mt-2 rounded-xl bg-gradient-to-r from-primary-coral to-pet-orange text-white text-xs font-bold shadow-sm"
                    onClick={onCreateListing}
                  >
                    List a Pet for Adoption
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {myPets.map((pet) => (
                  <div
                    key={pet.id}
                    className="p-3.5 rounded-2xl border border-border/30 bg-card flex items-center justify-between gap-3 shadow-xs hover:border-primary-coral/30 transition-all"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => setSelectedPet(pet)}
                    >
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                        {pet.image_urls && pet.image_urls.length > 0 ? (
                          <img
                            src={pet.image_urls[0]}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            🐾
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-foreground truncate">
                            {pet.name}
                          </h4>
                          {pet.is_adopted ? (
                            <Badge className="bg-emerald-600 text-white text-[9px] h-4 px-1.5 rounded">
                              Rehomed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 rounded text-primary-coral border-primary-coral/30 font-semibold">
                              Available
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {pet.breed || pet.type} • {pet.location || "Local"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!pet.is_adopted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          onClick={() => markPetAsAdopted(pet.id)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Adopted
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        onClick={() => {
                          if (confirm(`Delete listing for ${pet.name}?`)) {
                            deletePet(pet.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Saved Favorites Tab */}
          <TabsContent value="saved-pets" className="space-y-4 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Bookmarked Pet Listings
            </h3>

            {wishlistedPets.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-border/50 bg-muted/20 space-y-3">
                <div className="text-5xl">❤️🐾</div>
                <h4 className="font-bold text-base text-foreground">No saved pets yet</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Click the heart icon on any pet to save them for easy access later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {wishlistedPets.map((pet) => (
                  <div
                    key={pet.id}
                    className="p-3.5 rounded-2xl border border-border/30 bg-card flex items-center justify-between gap-3 shadow-xs hover:border-primary-coral/30 transition-all"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => setSelectedPet(pet)}
                    >
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                        {pet.image_urls && pet.image_urls.length > 0 ? (
                          <img
                            src={pet.image_urls[0]}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            🐾
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate">
                          {pet.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {pet.breed || pet.type} • {pet.location || "Local"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        className="h-8 px-3 rounded-xl bg-gradient-to-r from-primary-coral to-pet-orange text-white text-xs font-bold gap-1"
                        onClick={() => {
                          if (onNavigateToMessages) {
                            onNavigateToMessages();
                          }
                        }}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Chat
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-primary-coral"
                        onClick={() => toggleSavedPet(pet.id)}
                      >
                        <Heart className="w-4 h-4 fill-primary-coral" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Pet Details Modal */}
      {selectedPet && (
        <PetDetails
          pet={selectedPet}
          isOpen={!!selectedPet}
          onClose={() => setSelectedPet(null)}
          onStartChat={(petId, ownerId) => {
            if (onNavigateToMessages) {
              onNavigateToMessages();
            }
          }}
        />
      )}

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

