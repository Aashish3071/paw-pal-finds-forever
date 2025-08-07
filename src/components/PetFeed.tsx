import { useState } from "react";
import { Search, Filter, MapPin, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PetCard } from "./PetCard";
import { PetDetails } from "./PetDetails";
import { usePets, useSavedPets, useMyPets, Pet } from "@/hooks/usePets";
import { useConversations } from "@/hooks/useConversations";
import { useUserRole } from "@/hooks/useUserRole";

interface PetFeedProps {
  onCreateListing?: () => void;
  onNavigateToMessages?: (conversationId?: string) => void;
}

export function PetFeed({
  onCreateListing,
  onNavigateToMessages,
}: PetFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Get user role to determine what to show
  const { userRole, isLoading: isLoadingRole } = useUserRole();

  // Get pets based on user role
  const { pets: allPets, isLoading: isLoadingAllPets } = usePets();
  const { data: myPets = [], isLoading: isLoadingMyPets } = useMyPets();
  const { savedPets, toggleSavedPet } = useSavedPets();
  const { createConversation } = useConversations();

  // Determine which pets to show based on user role
  const pets = userRole === "owner" ? myPets : allPets;
  const isLoading = userRole === "owner" ? isLoadingMyPets : isLoadingAllPets;

  const handleWishlist = (petId: string) => {
    toggleSavedPet(petId);
  };

  const handleViewDetails = (petId: string) => {
    const pet = pets.find((p) => p.id === petId);
    if (pet) {
      setSelectedPet(pet);
    }
  };

  const handleStartChat = (petId: string, ownerId: string) => {
    createConversation({
      pet_id: petId,
      owner_id: ownerId,
      initial_message: "Hi! I'm interested in your pet.",
    });

    // Navigate to Messages tab
    if (onNavigateToMessages) {
      onNavigateToMessages();
    }
  };

  const formatAge = (ageInMonths: number) => {
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths === 1 ? "" : "s"}`;
    }
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;

    if (months === 0) {
      return `${years} year${years === 1 ? "" : "s"}`;
    }
    return `${years} year${years === 1 ? "" : "s"} ${months} month${
      months === 1 ? "" : "s"
    }`;
  };

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} week${
        Math.floor(diffDays / 7) === 1 ? "" : "s"
      } ago`;
    return `${Math.floor(diffDays / 30)} month${
      Math.floor(diffDays / 30) === 1 ? "" : "s"
    } ago`;
  };

  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userRole === "rehome") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Post Your Pet
            </h1>
            <p className="text-muted-foreground">
              Help your furry friend find a loving new home
            </p>
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={onCreateListing}
          >
            + Create New Listing
          </Button>

          <div className="text-center text-muted-foreground">
            <p>Your listings will appear here once created</p>
          </div>
        </div>

        {/* Pet Details Modal */}
        {selectedPet && (
          <PetDetails
            pet={selectedPet}
            isOpen={!!selectedPet}
            onClose={() => setSelectedPet(null)}
            onStartChat={handleStartChat}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/pet_logo_1.png"
                alt="PawPal Logo"
                className="h-8 w-auto mr-3 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {userRole === "owner" ? "My Pets" : "Find Your Pet Pal"}
                </h1>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {userRole === "owner"
                      ? "Manage your listings"
                      : "Near Mumbai"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare
                className="w-6 h-6 text-primary-coral cursor-pointer hover:text-primary-coral/80 transition-colors"
                onClick={onNavigateToMessages}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  // TODO: Implement filter functionality
                  console.log("Filter clicked");
                }}
              >
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search pets by name, breed, or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pet Grid */}
      <div className="max-w-md mx-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                <div className="h-48 bg-muted rounded-md mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPets.map((pet, index) => (
              <div
                key={pet.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PetCard
                  pet={{
                    id: pet.id,
                    name: pet.name,
                    breed: pet.breed,
                    petType: pet.type,
                    age: formatAge(pet.age),
                    gender: pet.gender as "male" | "female",
                    location: pet.location,
                    images: pet.image_urls || [],
                    description: pet.description,
                    isVaccinated: true, // Default to true, can be enhanced later
                    postedDate: formatPostedDate(pet.created_at),
                  }}
                  onWishlist={handleWishlist}
                  onViewDetails={handleViewDetails}
                  isWishlisted={savedPets.includes(pet.id)}
                />
              </div>
            ))}
          </div>
        )}

        {filteredPets.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{searchQuery ? "🔍" : "🐾"}</div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery
                ? "No pets found"
                : userRole === "owner"
                ? "No pets listed yet"
                : "No pets available yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try searching for dogs, cats, birds, rabbits, or other pets"
                : userRole === "owner"
                ? "Create your first pet listing to find them a new home"
                : "Check back soon for new pet listings!"}
            </p>
            {!searchQuery && onCreateListing && (
              <Button
                onClick={onCreateListing}
                className="bg-gradient-to-r from-primary-coral to-pet-orange text-white"
              >
                {userRole === "owner" ? "List Your Pet" : "List a Pet"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button for Creating Listings */}
      {onCreateListing && (
        <Button
          onClick={onCreateListing}
          size="lg"
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-primary-coral to-pet-orange text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-30"
          aria-label="Create pet listing"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
