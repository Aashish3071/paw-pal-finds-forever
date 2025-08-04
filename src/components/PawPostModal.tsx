import { useState } from "react";
import { X, Upload, Image as ImageIcon, Video, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PawPostModalProps {
  open: boolean;
  onClose: () => void;
  onPost: (postData: {
    content: string;
    petType: string;
    image?: string;
    video?: string;
  }) => void;
}

export function PawPostModal({ open, onClose, onPost }: PawPostModalProps) {
  const [content, setContent] = useState("");
  const [petType, setPetType] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const { toast } = useToast();

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 50MB for videos, 10MB for images)
      const maxSize = file.type.startsWith("video/")
        ? 50 * 1024 * 1024
        : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: file.type.startsWith("video/")
            ? "Video must be under 50MB"
            : "Image must be under 10MB",
          variant: "destructive",
        });
        return;
      }

      setMedia(file);
      setMediaType(file.type.startsWith("video/") ? "video" : "image");

      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handlePost = () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something about your pet moment!",
        variant: "destructive",
      });
      return;
    }

    if (!petType) {
      toast({
        title: "Pet type required",
        description: "Please select your pet type!",
        variant: "destructive",
      });
      return;
    }

    onPost({
      content: content.trim(),
      petType,
      image: mediaType === "image" ? mediaPreview || undefined : undefined,
      video: mediaType === "video" ? mediaPreview || undefined : undefined,
    });

    // Reset form
    setContent("");
    setPetType("");
    setMedia(null);
    setMediaPreview(null);
    setMediaType(null);

    toast({
      title: "Paw posted! 🐾",
      description: "Your moment has been shared with the community.",
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-background border border-border/20 shadow-xl">
        <DialogHeader className="border-b border-border/20 pb-4">
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <img
              src="/pet_logo_1.png"
              alt="PawPal Logo"
              className="h-5 w-auto object-contain"
            />
            Share a Paw Moment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              What's happening with your pet?
            </Label>
            <Textarea
              placeholder="Share a moment with your pet..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] border-border/20 focus:border-primary-coral/50 resize-none"
            />
          </div>

          {/* Pet Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Pet Type</Label>
            <Select value={petType} onValueChange={setPetType}>
              <SelectTrigger className="border-border/20">
                <SelectValue placeholder="Select your pet type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dog">🐕 Dog</SelectItem>
                <SelectItem value="Cat">🐱 Cat</SelectItem>
                <SelectItem value="Bird">🐦 Bird</SelectItem>
                <SelectItem value="Rabbit">🐰 Rabbit</SelectItem>
                <SelectItem value="Fish">🐠 Fish</SelectItem>
                <SelectItem value="Other">🐾 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Add Media</Label>
            {mediaPreview ? (
              <div className="relative">
                {mediaType === "image" ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border border-border/20"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="w-full h-40 object-cover rounded-lg border border-border/20"
                    controls
                    muted
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemoveMedia}
                >
                  ×
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {mediaType === "image" ? "📷 Photo" : "🎥 Video"}
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border/40 rounded-lg cursor-pointer hover:border-primary-coral/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <Video className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  Upload your moments
                </span>
                <span className="text-xs text-muted-foreground/70 mt-1">
                  Photos or videos
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleMediaUpload}
                />
              </label>
            )}
            <p className="text-xs text-muted-foreground">
              Images up to 10MB, Videos up to 50MB
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border/20">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="hero" className="flex-1" onClick={handlePost}>
            Post Paw 🐾
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
