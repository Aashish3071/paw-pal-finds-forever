import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
}: EditProfileModalProps) => {
  const { profile, updateProfile, isUpdating } = useProfile();
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    avatar_url: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-2 ring-primary-coral/20">
                  <AvatarImage
                    src={imagePreview || formData.avatar_url}
                    alt="Profile"
                  />
                  <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary-coral/20 to-pet-orange/20 text-primary-coral">
                    {formData.name?.charAt(0) || "🐾"}
                  </AvatarFallback>
                </Avatar>

                {/* Upload button */}
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-coral hover:bg-primary-coral/90 text-white flex items-center justify-center shadow-lg transition-colors">
                    <Camera className="h-4 w-4" />
                  </div>
                </label>

                {/* Hidden file input */}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Click camera to upload photo or take a picture
                </p>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                  >
                    Remove selected image
                  </button>
                )}
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                ref={nameInputRef}
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your name"
                required
                autoFocus={false}
                onFocus={(e) => {
                  // Prevent automatic text selection
                  setTimeout(() => {
                    e.target.setSelectionRange(
                      e.target.value.length,
                      e.target.value.length
                    );
                  }, 0);
                }}
              />
            </div>

            {/* Location Field */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="City, State/Country"
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="bio">Bio</Label>
                <span className="text-xs text-muted-foreground">
                  {formData.bio.length}/200
                </span>
              </div>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    handleChange("bio", e.target.value);
                  }
                }}
                placeholder="Tell us about yourself and your love for pets..."
                className="min-h-[120px] resize-none"
                maxLength={200}
              />
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="flex space-x-3 pt-4 bg-background border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-gradient-to-r from-primary-coral to-pet-orange text-white"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
