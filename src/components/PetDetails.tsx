import { useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Pet, useSavedPets } from "@/hooks/usePets";
import { useToast } from "@/hooks/use-toast";

interface PetDetailsProps {
  pet: Pet;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (petId: string, ownerId: string) => void;
}

export function PetDetails({
  pet,
  isOpen,
  onClose,
  onStartChat,
}: PetDetailsProps) {
  const { savedPets, toggleSavedPet } = useSavedPets();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isSaved = savedPets.includes(pet.id);

  const formatAge = (ageInMonths: number) => {
    if (!ageInMonths || ageInMonths === 0) return "Young";
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths === 1 ? "" : "s"}`;
    }
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;

    if (months === 0) {
      return `${years} year${years === 1 ? "" : "s"}`;
    }
    return `${years} yr${years === 1 ? "" : "s"} ${months} mo`;
  };

  const getPetEmoji = (type: string) => {
    switch (type?.toLowerCase()) {
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Adopt ${pet.name} on PawPal`,
        text: `Check out ${pet.name}, a lovely ${pet.breed} looking for a home!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Pet listing link copied to clipboard.",
      });
    }
  };

  const handleChatClick = () => {
    onStartChat(pet.id, pet.owner_id);
    onClose();
  };

  const images = pet.image_urls && pet.image_urls.length > 0 ? pet.image_urls : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[100dvh] sm:h-[90vh] p-0 overflow-hidden rounded-none sm:rounded-2xl border-0 sm:border flex flex-col bg-background">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border/30 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div className="text-center">
            <h2 className="font-bold text-sm text-foreground">{pet.name}</h2>
            <p className="text-[11px] text-muted-foreground">{pet.breed || pet.type}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="rounded-full hover:bg-muted"
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleSavedPet(pet.id)}
              className="rounded-full hover:bg-muted"
            >
              <Heart
                className={`w-4 h-4 ${
                  isSaved
                    ? "fill-primary-coral text-primary-coral"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Main Photo Gallery */}
          <div className="relative aspect-[4/3] w-full bg-muted/40 overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[currentImageIndex]}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-coral/10 to-pet-orange/10 flex flex-col items-center justify-center gap-2">
                <span className="text-6xl">{getPetEmoji(pet.type)}</span>
                <span className="text-xs text-muted-foreground font-semibold">
                  {pet.type}
                </span>
              </div>
            )}

            {/* Price Badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-md">
                Free Adoption
              </Badge>
            </div>

            {/* Multi-image indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "bg-white w-4"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Strip (if multiple photos) */}
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-muted/20 border-b border-border/20">
              {images.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    idx === currentImageIndex
                      ? "border-primary-coral scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Details Section */}
          <div className="p-4 space-y-5">
            {/* Title & Location Header */}
            <div className="space-y-1 pb-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-foreground">
                  {pet.name}
                </h1>
                <Badge
                  variant="outline"
                  className="font-bold uppercase text-[11px] px-2 py-0.5"
                >
                  {pet.gender}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary-coral flex-shrink-0" />
                <span>{pet.location || "Location not specified"}</span>
              </div>
            </div>

            {/* Key Specs Grid (OLX-style) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                Overview & Details
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-0.5">
                  <span className="text-[11px] text-muted-foreground block">Species</span>
                  <span className="font-bold text-sm text-foreground flex items-center gap-1">
                    <span>{getPetEmoji(pet.type)}</span>
                    <span className="capitalize">{pet.type}</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-0.5">
                  <span className="text-[11px] text-muted-foreground block">Breed</span>
                  <span className="font-bold text-sm text-foreground line-clamp-1">
                    {pet.breed || "Mixed"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-0.5">
                  <span className="text-[11px] text-muted-foreground block">Age</span>
                  <span className="font-bold text-sm text-foreground">
                    {formatAge(pet.age)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-0.5">
                  <span className="text-[11px] text-muted-foreground block">Vaccination</span>
                  <span className="font-bold text-sm text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Up to date</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Description & Story */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Description & Temperament
              </h3>
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/20 text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {pet.description ||
                  `${pet.name} is a friendly and lovely ${pet.breed || pet.type} looking for a warm, caring forever home.`}
              </div>
            </div>

            {/* Owner Profile Card */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Listed By (Owner)
              </h3>
              <div className="p-3.5 rounded-2xl bg-card border border-border/40 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 ring-2 ring-primary-coral/20">
                    <AvatarImage src={pet.owner?.avatar_url} />
                    <AvatarFallback className="bg-primary-coral/10 text-primary-coral font-bold text-sm">
                      {pet.owner?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {pet.owner?.name || "Pet Parent"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Verified Listing Owner
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] text-primary-coral border-primary-coral/30">
                  Direct Contact
                </Badge>
              </div>
            </div>

            {/* Safe Adoption Advisory */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Always meet in a safe public place or arrange a home visit before finalizing adoption.
              </span>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-md border-t border-border/30 z-30 max-w-md mx-auto flex items-center gap-2.5">
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 rounded-xl flex-shrink-0 border-border/60 hover:bg-muted"
            onClick={() => toggleSavedPet(pet.id)}
          >
            <Heart
              className={`w-5 h-5 ${
                isSaved
                  ? "fill-primary-coral text-primary-coral"
                  : "text-muted-foreground"
              }`}
            />
          </Button>

          <Button
            size="lg"
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary-coral to-pet-orange text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            onClick={handleChatClick}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat with Owner</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

