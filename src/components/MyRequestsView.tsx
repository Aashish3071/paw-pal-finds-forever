import { useState } from "react";
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  MessageCircle,
  Check,
  X,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCareRequests } from "@/hooks/useCareRequests";
import { useCareApplications } from "@/hooks/useCareApplications";

export function MyRequestsView() {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [showApplications, setShowApplications] = useState(false);

  const {
    myCareRequests,
    isLoadingMine,
    deleteCareRequest,
    updateCareRequest,
  } = useCareRequests();
  const { useRequestApplications, approveApplication, rejectApplication } =
    useCareApplications();

  const { data: applications = [] } = useRequestApplications(
    selectedRequestId || ""
  );

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewApplications = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowApplications(true);
  };

  const handleApproveApplication = (applicationId: string) => {
    approveApplication(applicationId);
    setShowApplications(false);
    setSelectedRequestId(null);
  };

  const handleRejectApplication = (applicationId: string) => {
    rejectApplication(applicationId);
  };

  const handleDeleteRequest = (requestId: string) => {
    if (window.confirm("Are you sure you want to delete this care request?")) {
      deleteCareRequest(requestId);
    }
  };

  const handleCompleteRequest = (requestId: string) => {
    updateCareRequest({
      id: requestId,
      updates: { status: "completed" },
    });
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

  if (myCareRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No care requests yet
        </h3>
        <p className="text-muted-foreground">
          Create your first care request to find caretakers for your pets
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {myCareRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {request.pet?.image_urls?.[0] && (
                    <img
                      src={request.pet.image_urls[0]}
                      alt={request.pet.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-base">{request.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {request.pet?.name} • {request.pet?.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs ${getStatusColor(request.status)}`}
                  >
                    {request.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {request.status === "assigned" && (
                        <DropdownMenuItem
                          onClick={() => handleCompleteRequest(request.id)}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Mark Completed
                        </DropdownMenuItem>
                      )}
                      {request.status === "open" && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Delete Request
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Location */}
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                <MapPin className="w-3 h-3" />
                {request.location}
              </p>

              {/* Description */}
              {request.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {request.description}
                </p>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
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

              {/* Applications Count & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{request.applications?.length || 0} applications</span>
                </div>

                <div className="flex gap-2">
                  {(request.applications?.length || 0) > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewApplications(request.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Applications
                    </Button>
                  )}
                  {request.assigned_caretaker_id && (
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications Modal */}
      <Dialog open={showApplications} onOpenChange={setShowApplications}>
        <DialogContent className="max-w-md mx-auto bg-background border border-border/20 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border/20 pb-4">
            <DialogTitle className="text-lg font-bold text-foreground">
              Care Applications
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No applications yet</p>
              </div>
            ) : (
              applications.map((application) => (
                <Card
                  key={application.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    {/* Applicant Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={application.applicant?.avatar_url} />
                        <AvatarFallback className="bg-primary-coral/10 text-primary-coral">
                          {application.applicant?.name?.[0] || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {application.applicant?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {application.applicant?.location}
                        </p>
                        {application.applicant?.bio && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {application.applicant.bio}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          application.status === "approved"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {application.status}
                      </Badge>
                    </div>

                    {/* Message */}
                    <div className="p-3 bg-muted/30 rounded-lg mb-3">
                      <p className="text-sm">{application.message}</p>
                    </div>

                    {/* Proposed Rate */}
                    {application.proposed_rate && (
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-green-600 font-medium">
                          ${application.proposed_rate}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    {application.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleRejectApplication(application.id)
                          }
                          className="flex-1"
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleApproveApplication(application.id)
                          }
                          className="flex-1 bg-gradient-to-r from-primary-coral to-pet-orange text-white"
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
