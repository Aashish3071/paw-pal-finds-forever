import { useState, useMemo } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PetCard } from "./PetCard";
import { PetDetails } from "./PetDetails";
import { usePets, useSavedPets, Pet } from "@/hooks/usePets";
import { useConversations } from "@/hooks/useConversations";

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

  const { pets, isLoading } = usePets();
  const { savedPets, toggleSavedPet } = useSavedPets();
  const { createConversation } = useConversations();

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
    createConversation(
      {
        pet_id: petId,
        owner_id: ownerId,
        initial_message: "Hi! I am interested in adopting your pet. Is it still available?",
      },
      {
        onSuccess: (newConv: any) => {
          if (onNavigateToMessages) {
            onNavigateToMessages(newConv?.id);
          }
        },
      }
    );
  };

  // Filter pets dynamically based on search query (name, breed, location, type, gender, description)
  const filteredPets = useMemo(() => {
    if (!searchQuery.trim()) {
      return pets;
    }
    const query = searchQuery.toLowerCase().trim();
    return pets.filter((pet) => {
      const matchesName = pet.name?.toLowerCase().includes(query);
      const matchesBreed = pet.breed?.toLowerCase().includes(query);
      const matchesLocation = pet.location?.toLowerCase().includes(query);
      const matchesType = pet.type?.toLowerCase().includes(query);
      const matchesGender = pet.gender?.toLowerCase() === query;
      const matchesDescription = pet.description?.toLowerCase().includes(query);

      return (
        matchesName ||
        matchesBreed ||
        matchesLocation ||
        matchesType ||
        matchesGender ||
        matchesDescription
      );
    });
  }, [pets, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Search Header Banner */}
      <section className="bg-gradient-to-b from-muted/30 via-background to-background border-b border-border/30 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Find Your Forever Friend 🐾
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Search loving pets ready for adoption by name, breed, species, or city.
            </p>
          </div>

          {/* Unified Search Input Bar */}
          <div className="relative max-w-xl mx-auto pt-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by dog, cat, Golden Retriever, Mumbai, female..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10 h-13 rounded-2xl bg-card border-border/50 text-sm sm:text-base shadow-sm focus-visible:ring-primary-coral/40"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Feed Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Results Counter Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base sm:text-lg text-foreground">
              {searchQuery.trim() ? `Search Results for "${searchQuery}"` : "Available Pets"}
            </h2>
            <Badge variant="secondary" className="text-xs font-bold px-2.5 py-0.5 rounded-lg">
              {filteredPets.length} {filteredPets.length === 1 ? "pet" : "pets"}
            </Badge>
          </div>

          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground font-semibold"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          )}
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-muted/40 animate-pulse border border-border/30"
              />
            ))}
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-border/60 bg-muted/10 space-y-4 max-w-lg mx-auto">
            <div className="text-6xl animate-bounce">🔍🐾</div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-foreground">
                No pets found
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {searchQuery
                  ? `We couldn't find any pets matching "${searchQuery}". Try searching a different breed, species, or location.`
                  : "No pet listings available yet. Be the first to list a pet for adoption!"}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-semibold"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
              {onCreateListing && (
                <Button
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-primary-coral to-pet-orange text-white text-xs font-bold shadow-sm"
                  onClick={onCreateListing}
                >
                  List a Pet
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onWishlist={handleWishlist}
                onViewDetails={handleViewDetails}
                onStartChat={handleStartChat}
                isWishlisted={savedPets.includes(pet.id)}
              />
            ))}
          </div>
        )}
      </main>

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


