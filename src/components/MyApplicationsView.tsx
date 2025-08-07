import {
  Calendar,
  MapPin,
  DollarSign,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCareApplications } from "@/hooks/useCareApplications";

export function MyApplicationsView() {
  const { myApplications, isLoadingMine } = useCareApplications();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
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
    if (!amount) return "Negotiable";
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
          label: "Pending",
        };
      case "approved":
        return {
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
          label: "Approved",
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800",
          icon: XCircle,
          label: "Declined",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: Clock,
          label: status,
        };
    }
  };

  const formatApplicationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffDays === 0) {
      if (diffHours === 0) return "Just now";
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (isLoadingMine) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (myApplications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No applications yet
        </h3>
        <p className="text-muted-foreground">
          Browse care requests and submit your first application to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myApplications.map((application) => {
        const statusConfig = getStatusConfig(application.status);
        const StatusIcon = statusConfig.icon;

        return (
          <Card
            key={application.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={application.request?.owner.avatar_url} />
                    <AvatarFallback className="bg-primary-coral/10 text-primary-coral">
                      {application.request?.owner.name?.[0] || "O"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {application.request?.owner.name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {application.request?.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${statusConfig.color}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>

              {/* Pet Info */}
              <div className="flex items-center gap-3 mb-3">
                {application.request?.pet.image_urls?.[0] && (
                  <img
                    src={application.request.pet.image_urls[0]}
                    alt={application.request.pet.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-base">
                    {application.request?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {application.request?.pet.name} •{" "}
                    {application.request?.pet.type}
                  </p>
                </div>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {application.request?.start_date &&
                        formatDate(application.request.start_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {application.request?.start_date &&
                        application.request?.end_date &&
                        formatDuration(
                          application.request.start_date,
                          application.request.end_date
                        )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-green-600">
                      {application.proposed_rate
                        ? `$${application.proposed_rate}`
                        : formatCompensation(
                            application.request?.compensation,
                            application.request?.compensation_type
                          )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Message Preview */}
              <div className="p-3 bg-muted/30 rounded-lg mb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {application.message}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Applied {formatApplicationDate(application.created_at)}
                </p>

                <div className="flex gap-2">
                  {application.status === "approved" &&
                    application.request?.status === "assigned" && (
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message Owner
                      </Button>
                    )}
                </div>
              </div>

              {/* Request Status Info */}
              {application.request?.status === "assigned" &&
                application.status === "approved" && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      🎉 Congratulations! You've been selected as the caretaker.
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      You can now message the pet owner to coordinate the care
                      details.
                    </p>
                  </div>
                )}

              {/* Request Status - Cancelled/Completed */}
              {(application.request?.status === "cancelled" ||
                application.request?.status === "completed") && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    This care request has been {application.request.status}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
