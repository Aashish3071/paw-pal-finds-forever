import { useState, useEffect } from "react";
import { DollarSign, Calendar, MapPin, User, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCareRequests } from "@/hooks/useCareRequests";
import {
  useCareApplications,
  CreateCareApplicationData,
} from "@/hooks/useCareApplications";

interface CareApplicationModalProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CareApplicationModal({
  requestId,
  isOpen,
  onClose,
}: CareApplicationModalProps) {
  const [applicationData, setApplicationData] = useState<
    Partial<CreateCareApplicationData>
  >({
    request_id: requestId,
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { careRequests } = useCareRequests();
  const { createApplication, isCreating } = useCareApplications();

  const request = careRequests.find((r) => r.id === requestId);

  useEffect(() => {
    setApplicationData((prev) => ({ ...prev, request_id: requestId }));
  }, [requestId]);

  const handleInputChange = (
    field: keyof CreateCareApplicationData,
    value: string | number
  ) => {
    setApplicationData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!applicationData.message?.trim()) {
      newErrors.message = "Please include a message with your application";
    }

    if (applicationData.proposed_rate && applicationData.proposed_rate < 0) {
      newErrors.proposed_rate = "Rate must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    createApplication(applicationData as CreateCareApplicationData);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const formatDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30)
      return `${Math.ceil(diffDays / 7)} week${diffDays >= 14 ? "s" : ""}`;
    return `${Math.ceil(diffDays / 30)} month${diffDays >= 60 ? "s" : ""}`;
  };

  const formatCompensation = (amount?: number, type?: string) => {
    if (!amount) return "Compensation negotiable";
    const formatted = `$${amount}`;
    switch (type) {
      case "daily":
        return `${formatted}/day`;
      case "hourly":
        return `${formatted}/hr`;
      default:
        return formatted;
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-background border border-border/20 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/20 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-foreground">
              Apply for Care Request
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Request Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={request.owner_avatar_url} />
                <AvatarFallback className="bg-primary-coral/10 text-primary-coral">
                  {request.owner_name?.[0] || "O"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{request.owner_name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {request.location}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {request.applications_count || 0} applications
              </Badge>
            </div>

            {/* Pet Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              {request.pet_image_url && (
                <img
                  src={request.pet_image_url}
                  alt={request.pet_name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold">{request.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {request.pet_name} • {request.pet_type}
                </p>
              </div>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatDate(request.start_date)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(request.start_date, request.end_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-green-600">
                    {formatCompensation(
                      request.compensation,
                      request.compensation_type
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {request.description && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {request.description}
                </p>
              </div>
            )}

            {/* Instructions */}
            {request.instructions && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">
                  Special Instructions
                </h4>
                <p className="text-sm text-muted-foreground">
                  {request.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Application Form */}
          <div className="space-y-4 border-t border-border/20 pt-4">
            <h4 className="font-semibold">Your Application</h4>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message to Owner *
              </Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain why you'd be a great caretaker for their pet..."
                value={applicationData.message || ""}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className={`min-h-[100px] ${
                  errors.message ? "border-red-500" : ""
                }`}
              />
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            {/* Proposed Rate */}
            <div className="space-y-2">
              <Label htmlFor="proposed_rate" className="text-sm font-medium">
                Your Rate (Optional)
              </Label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="proposed_rate"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={applicationData.proposed_rate || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "proposed_rate",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className={`flex-1 ${
                    errors.proposed_rate ? "border-red-500" : ""
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  {request.compensation_type === "daily"
                    ? "/day"
                    : request.compensation_type === "hourly"
                    ? "/hr"
                    : "total"}
                </span>
              </div>
              {errors.proposed_rate && (
                <p className="text-sm text-red-500">{errors.proposed_rate}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Leave blank to discuss rate with the owner
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreating}
              className="flex-1 bg-gradient-to-r from-primary-coral to-pet-orange text-white"
            >
              {isCreating ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
