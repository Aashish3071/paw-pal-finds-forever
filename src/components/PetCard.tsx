import { Heart, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface Pet {
  id: string;
  name: string;
  breed: string;
  petType: string;
  age: string;
  gender: 'male' | 'female';
  location: string;
  images: string[];
  description: string;
  isVaccinated: boolean;
  postedDate: string;
}

interface PetCardProps {
  pet: Pet;
  onWishlist?: (petId: string) => void;
  onViewDetails?: (petId: string) => void;
  isWishlisted?: boolean;
}

export function PetCard({ pet, onWishlist, onViewDetails, isWishlisted = false }: PetCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const handleWishlistClick = () => {
    setIsHeartAnimating(true);
    onWishlist?.(pet.id);
    setTimeout(() => setIsHeartAnimating(false), 300);
  };

  const getPetEmoji = (petType: string) => {
    switch (petType.toLowerCase()) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'rabbit': return '🐰';
      case 'fish': return '🐠';
      default: return '🐾';
    }
  };

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          {!imageError ? (
            <img
              src={pet.images[0]}
              alt={pet.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-coral-light to-sky-blue-light flex items-center justify-center">
              <div className="text-6xl">{getPetEmoji(pet.petType)}</div>
            </div>
          )}
        </div>
        
        {onWishlist && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 bg-white/80 hover:bg-white shadow-sm ${
              isHeartAnimating ? 'animate-heart-bounce' : ''
            }`}
            onClick={handleWishlistClick}
          >
            <Heart 
              className={`w-5 h-5 ${
                isWishlisted 
                  ? 'fill-primary text-primary' 
                  : 'text-muted-foreground'
              }`} 
            />
          </Button>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-foreground">{pet.name}</h3>
            <span className="text-sm px-2 py-1 rounded-full bg-accent text-accent-foreground">
              {pet.gender}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPetEmoji(pet.petType)}</span>
            <p className="text-muted-foreground">{pet.breed} • {pet.age}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {pet.location}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {pet.postedDate}
          </div>
        </div>
        
        {pet.isVaccinated && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sky-blue-light text-sky-blue text-xs">
            ✅ Vaccinated
          </div>
        )}
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {pet.description}
        </p>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onViewDetails?.(pet.id)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}