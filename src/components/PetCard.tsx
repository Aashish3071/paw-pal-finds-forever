import { Heart, MapPin, Clock, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Pet } from "@/hooks/usePets";

interface PetCardProps {
  pet: Pet;
  onWishlist?: (petId: string) => void;
  onViewDetails?: (petId: string) => void;
  onStartChat?: (petId: string, ownerId: string) => void;
  isWishlisted?: boolean;
}

export function PetCard({
  pet,
  onWishlist,
  onViewDetails,
  onStartChat,
  isWishlisted = false,
}: PetCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartAnimating(true);
    onWishlist?.(pet.id);
    setTimeout(() => setIsHeartAnimating(false), 300);
  };

  const getPetEmoji = (petType: string) => {
    switch (petType?.toLowerCase()) {
      case "dog":
        return "🐕";
      case "cat":
        return "🐱";
      case "bird":
        return "🐦";
      case "rabbit":
        return "🐰";
      case "fish":
        return "🐠";
      default:
        return "🐾";
    }
  };

  const formatAge = (ageInMonths: number) => {
    if (!ageInMonths || ageInMonths === 0) return "Young";
    if (ageInMonths < 12) {
      return `${ageInMonths} mo`;
    }
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    if (months === 0) {
      return `${years} yr${years > 1 ? "s" : ""}`;
    }
    return `${years}y ${months}m`;
  };

  const formatPostedDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  const imageUrl = pet.image_urls && pet.image_urls.length > 0 ? pet.image_urls[0] : undefined;

  return (
    <Card
      onClick={() => onViewDetails?.(pet.id)}
      className="group overflow-hidden rounded-2xl border border-border/30 bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Pet Image Banner */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={pet.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-coral/10 via-soft-cream to-pet-orange/10 flex flex-col items-center justify-center gap-1">
              <span className="text-4xl">{getPetEmoji(pet.type)}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {pet.type || "Pet"}
              </span>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <span>{getPetEmoji(pet.type)}</span>
            <span className="capitalize">{pet.type}</span>
          </div>

          {/* Wishlist Button */}
          {onWishlist && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-background/80 backdrop-blur-md hover:bg-background shadow-sm transition-transform ${
                isHeartAnimating ? "scale-125" : ""
              }`}
              onClick={handleWishlistClick}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isWishlisted
                    ? "fill-primary-coral text-primary-coral"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          )}

          {/* Adoption Badge (Free / Rehome) */}
          <div className="absolute bottom-2.5 left-2.5">
            <Badge className="bg-emerald-600/90 hover:bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              Free Adoption
            </Badge>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-3.5 space-y-2">
          {/* Pet Name & Gender */}
          <div className="flex items-start justify-between gap-1">
            <div>
              <h3 className="font-bold text-base text-foreground leading-tight line-clamp-1 group-hover:text-primary-coral transition-colors">
                {pet.name}
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1">
                {pet.breed || "Mixed Breed"} • {formatAge(pet.age)}
              </p>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                pet.gender?.toLowerCase() === "male"
                  ? "bg-blue-500/10 text-blue-600"
                  : "bg-pink-500/10 text-pink-600"
              }`}
            >
              {pet.gender || "Pet"}
            </span>
          </div>

          {/* Location & Time */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/20">
            <div className="flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-primary-coral flex-shrink-0" />
              <span className="truncate">{pet.location || "Local Area"}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3 text-muted-foreground/70" />
              <span>{formatPostedDate(pet.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-3.5 pb-3.5 pt-1 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs font-semibold rounded-xl border-border/50 hover:bg-muted/60"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(pet.id);
          }}
        >
          Details
        </Button>
        <Button
          size="sm"
          className="h-8 text-xs font-semibold rounded-xl bg-gradient-to-r from-primary-coral to-pet-orange text-white shadow-sm hover:shadow hover:opacity-95 flex items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            onStartChat?.(pet.id, pet.owner_id);
          }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Chat
        </Button>
      </div>
    </Card>
  );
}