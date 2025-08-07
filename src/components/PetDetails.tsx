import { useState } from "react";
import { ArrowLeft, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

  const getPetSize = (type: string, breed: string) => {
    // Simple logic to determine size based on breed
    const largeDogBreeds = [
      "golden retriever",
      "labrador",
      "german shepherd",
      "rottweiler",
      "great dane",
    ];
    const smallDogBreeds = [
      "chihuahua",
      "pomeranian",
      "yorkshire terrier",
      "maltese",
      "pug",
    ];

    if (type.toLowerCase() === "dog") {
      if (largeDogBreeds.some((b) => breed.toLowerCase().includes(b)))
        return "Large";
      if (smallDogBreeds.some((b) => breed.toLowerCase().includes(b)))
        return "Small";
      return "Medium";
    }
    if (type.toLowerCase() === "cat") return "Medium";
    return "Small";
  };

  const getPetTraits = (type: string, breed: string) => {
    // Simple logic to assign traits based on breed
    if (breed.toLowerCase().includes("golden retriever")) {
      return "Friendly, Energetic, Playful";
    }
    if (breed.toLowerCase().includes("labrador")) {
      return "Loyal, Active, Intelligent";
    }
    if (breed.toLowerCase().includes("persian")) {
      return "Calm, Gentle, Affectionate";
    }
    // Default traits
    return "Friendly, Energetic, Playful";
  };

  const getIdealHome = (type: string, breed: string) => {
    const largeDogBreeds = ["golden retriever", "labrador", "german shepherd"];
    if (largeDogBreeds.some((b) => breed.toLowerCase().includes(b))) {
      return "Active household with a yard";
    }
    return "Loving family home";
  };

  const handleChatClick = () => {
    onStartChat(pet.id, pet.owner_id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[100vh] p-0 overflow-hidden rounded-none border-0">
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-lg font-semibold">PawPal</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Pet Image */}
            <div className="relative bg-gradient-to-b from-orange-50 to-orange-100">
              <div className="aspect-[4/3] flex items-center justify-center">
                {pet.image_urls && pet.image_urls.length > 0 ? (
                  <img
                    src={pet.image_urls[currentImageIndex]}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-orange-200 rounded-full flex items-center justify-center">
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
            <div className="p-6 space-y-6">
              {/* Pet Name */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  About {pet.name}
                </h2>
              </div>

              {/* Basic Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Breed</span>
                  <span className="text-gray-900 font-semibold">
                    {pet.breed}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Age</span>
                  <span className="text-gray-900 font-semibold">
                    {formatAge(pet.age)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Size</span>
                  <span className="text-gray-900 font-semibold">
                    {getPetSize(pet.type, pet.breed)}
                  </span>
                </div>
              </div>

              {/* Biography */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Biography
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {pet.description ||
                    `${pet.name} is a friendly and energetic ${pet.breed} looking for a loving home. He loves playing fetch, going for walks, and cuddling with his humans. ${pet.name} is well-trained and gets along well with children and other dogs. He would thrive in an active household with a yard to play in.`}
                </p>
              </div>

              {/* Personality */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Personality
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Traits</span>
                    <span className="text-gray-900 font-semibold">
                      {getPetTraits(pet.type, pet.breed)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">
                      Ideal Home
                    </span>
                    <span className="text-gray-900 font-semibold text-right">
                      {getIdealHome(pet.type, pet.breed)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Contact
                </h3>
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={pet.owner?.avatar_url} />
                    <AvatarFallback>
                      {pet.owner?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {pet.owner?.name || "Pet Owner"}
                    </p>
                    <p className="text-sm text-gray-500">Owner</p>
                  </div>
                </div>
              </div>

              {/* Adopt Button */}
              <div className="pt-4 pb-8">
                <Button
                  onClick={handleChatClick}
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl text-lg"
                >
                  Adopt Me
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
