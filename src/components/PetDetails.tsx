import { useState } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  MapPin,
  Calendar,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pet } from "@/hooks/usePets";
import { useSavedPets } from "@/hooks/usePets";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isSaved = savedPets.includes(pet.id);

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
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  const handleChatClick = () => {
    onStartChat(pet.id, pet.owner_id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-4 pb-2 bg-background border-b">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <DialogTitle className="text-lg font-semibold">
                Pet Details
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleSavedPet(pet.id)}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isSaved
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-square bg-muted">
                {pet.image_urls && pet.image_urls.length > 0 ? (
                  <img
                    src={pet.image_urls[currentImageIndex]}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-4xl">🐾</span>
                  </div>
                )}
              </div>

              {/* Image indicators */}
              {pet.image_urls && pet.image_urls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {pet.image_urls.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pet Info */}
            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {pet.name}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{pet.type}</Badge>
                  <Badge variant="outline">{pet.breed}</Badge>
                  <Badge variant="outline">{pet.gender}</Badge>
                  <Badge variant="outline">{formatAge(pet.age)}</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{pet.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {formatPostedDate(pet.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <Card className="border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={pet.owner?.avatar_url} />
                      <AvatarFallback>
                        {pet.owner?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {pet.owner?.name || "Pet Owner"}
                      </p>
                      <p className="text-sm text-muted-foreground">Pet Owner</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleChatClick}
                    className="w-full bg-primary-coral hover:bg-primary-coral/90"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-primary-coral" />
                    <h4 className="font-medium text-foreground">
                      About {pet.name}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pet.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>

              {/* Additional spacing for bottom navigation */}
              <div className="h-4" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
