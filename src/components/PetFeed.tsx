import { useState } from "react";
import { Search, Filter, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PetCard } from "./PetCard";

// Mock data for development - Now includes all pet types
const mockPets = [
  {
    id: "1",
    name: "Buddy",
    breed: "Golden Retriever",
    petType: "Dog",
    age: "2 years",
    gender: "male" as const,
    location: "Mumbai, Maharashtra",
    images: ["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"],
    description: "Friendly and energetic dog, great with kids. Looking for a loving family.",
    isVaccinated: true,
    postedDate: "2 days ago"
  },
  {
    id: "2", 
    name: "Luna", 
    breed: "Persian Cat",
    petType: "Cat",
    age: "1 year",
    gender: "female" as const,
    location: "Delhi, NCR",
    images: ["https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400"],
    description: "Beautiful and calm Persian cat, loves cuddles and quiet spaces.",
    isVaccinated: true,
    postedDate: "1 week ago"
  },
  {
    id: "3",
    name: "Rocky", 
    breed: "German Shepherd",
    petType: "Dog",
    age: "5 years",
    gender: "male" as const,
    location: "Bangalore, Karnataka",
    images: ["https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400"],
    description: "Well-trained guard dog, loyal and protective. Good with experienced owners.",
    isVaccinated: true,
    postedDate: "3 days ago"
  },
  {
    id: "4",
    name: "Chirpy",
    breed: "Budgerigar",
    petType: "Bird",
    age: "6 months", 
    gender: "male" as const,
    location: "Pune, Maharashtra",
    images: ["https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400"],
    description: "Colorful and talkative budgie, loves to sing and play. Comes with cage.",
    isVaccinated: false,
    postedDate: "3 days ago"
  },
  {
    id: "5",
    name: "Snowball",
    breed: "Holland Lop",
    petType: "Rabbit",
    age: "8 months",
    gender: "female" as const,
    location: "Chennai, Tamil Nadu",
    images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400"],
    description: "Gentle rabbit who loves fresh vegetables and hopping around the garden.",
    isVaccinated: true,
    postedDate: "5 days ago"
  }
];

interface PetFeedProps {
  userRole: 'adopt' | 'rehome';
  onCreateListing?: () => void;
}

export function PetFeed({ userRole, onCreateListing }: PetFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistedPets, setWishlistedPets] = useState<Set<string>>(new Set());

  const handleWishlist = (petId: string) => {
    setWishlistedPets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(petId)) {
        newSet.delete(petId);
      } else {
        newSet.add(petId);
      }
      return newSet;
    });
  };

  const handleViewDetails = (petId: string) => {
    console.log("View details for pet:", petId);
    // TODO: Navigate to pet details page
  };

  const filteredPets = mockPets.filter(pet => 
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pet.petType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (userRole === 'rehome') {
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
          
          <Button variant="hero" size="lg" className="w-full" onClick={onCreateListing}>
            + Create New Listing
          </Button>
          
          <div className="text-center text-muted-foreground">
            <p>Your listings will appear here once created</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Find Your Pet Pal</h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Near Mumbai</span>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Filter className="w-5 h-5" />
            </Button>
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
        <div className="grid gap-4">
          {filteredPets.map((pet, index) => (
            <div 
              key={pet.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PetCard
                pet={pet}
                onWishlist={handleWishlist}
                onViewDetails={handleViewDetails}
                isWishlisted={wishlistedPets.has(pet.id)}
              />
            </div>
          ))}
        </div>
        
        {filteredPets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No pets found
            </h3>
            <p className="text-muted-foreground">
              Try searching for dogs, cats, birds, rabbits, or other pets
            </p>
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