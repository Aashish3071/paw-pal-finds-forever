import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useCareRequests,
  CreateCareRequestData,
} from "@/hooks/useCareRequests";
import { Pet } from "@/hooks/usePets";

interface CareRequestFormProps {
  onBack: () => void;
  userPets: Pet[];
}

export function CareRequestForm({ onBack, userPets }: CareRequestFormProps) {
  const [formData, setFormData] = useState<Partial<CreateCareRequestData>>({
    compensation_type: "total",
  });
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createCareRequest, isCreating } = useCareRequests();

  const handlePetSelect = (petId: string) => {
    const pet = userPets.find((p) => p.id === petId);
    if (pet) {
      setSelectedPet(pet);
      setFormData((prev) => ({ ...prev, pet_id: petId }));
      setErrors((prev) => ({ ...prev, pet_id: "" }));
    }
  };

  const handleInputChange = (
    field: keyof CreateCareRequestData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.pet_id) newErrors.pet_id = "Please select a pet";
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (!formData.location?.trim()) newErrors.location = "Location is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";

    // Validate dates
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        newErrors.start_date = "Start date cannot be in the past";
      }

      if (endDate <= startDate) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    if (formData.compensation && formData.compensation < 0) {
      newErrors.compensation = "Compensation must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    createCareRequest(formData as CreateCareRequestData);
    onBack();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/20 z-10">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Create Care Request
              </h1>
              <p className="text-sm text-muted-foreground">
                Find a caretaker for your pet
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Pet Selection */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-base font-semibold mb-3 block">
              Select Pet
            </Label>
            {userPets.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🐾</div>
                <p className="text-muted-foreground text-sm">
                  You need to add a pet first before creating a care request.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={onBack}
                >
                  Add Pet First
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {userPets.map((pet) => (
                  <div
                    key={pet.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPet?.id === pet.id
                        ? "border-primary-coral bg-primary-coral/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => handlePetSelect(pet.id)}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={pet.image_urls?.[0]} />
                      <AvatarFallback className="bg-primary-coral/10 text-primary-coral">
                        {pet.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{pet.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pet.type} • {pet.breed}
                      </p>
                    </div>
                  </div>
                ))}
                {errors.pet_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.pet_id}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <Label className="text-base font-semibold">Basic Information</Label>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">
                Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Need caretaker for Buddy while on vacation"
                value={formData.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Any special instructions or details about your pet..."
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-sm flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={formData.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm">
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formatDateTime(formData.start_date || "")}
                  onChange={(e) =>
                    handleInputChange("start_date", e.target.value)
                  }
                  className={errors.start_date ? "border-red-500" : ""}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500">{errors.start_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-sm">
                  End Date
                </Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formatDateTime(formData.end_date || "")}
                  onChange={(e) =>
                    handleInputChange("end_date", e.target.value)
                  }
                  className={errors.end_date ? "border-red-500" : ""}
                />
                {errors.end_date && (
                  <p className="text-sm text-red-500">{errors.end_date}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Compensation (Optional)
            </Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="compensation" className="text-sm">
                  Amount
                </Label>
                <Input
                  id="compensation"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.compensation || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "compensation",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className={errors.compensation ? "border-red-500" : ""}
                />
                {errors.compensation && (
                  <p className="text-sm text-red-500">{errors.compensation}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="compensation_type" className="text-sm">
                  Type
                </Label>
                <Select
                  value={formData.compensation_type || "total"}
                  onValueChange={(value) =>
                    handleInputChange("compensation_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">Total Amount</SelectItem>
                    <SelectItem value="daily">Per Day</SelectItem>
                    <SelectItem value="hourly">Per Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Special Instructions (Optional)
            </Label>

            <Textarea
              placeholder="Feeding schedule, medication, favorite activities, emergency contacts..."
              value={formData.instructions || ""}
              onChange={(e) =>
                handleInputChange("instructions", e.target.value)
              }
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCreating || userPets.length === 0}
            className="flex-1 bg-gradient-to-r from-primary-coral to-pet-orange text-white"
          >
            {isCreating ? "Creating..." : "Create Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}
