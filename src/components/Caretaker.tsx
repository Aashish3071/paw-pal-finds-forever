import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCareRequests } from "@/hooks/useCareRequests";
import { useCareApplications } from "@/hooks/useCareApplications";
import { usePets } from "@/hooks/usePets";
import { CareRequestForm } from "./CareRequestForm";
import { CareApplicationModal } from "./CareApplicationModal";
import { MyRequestsView } from "./MyRequestsView";
import { MyApplicationsView } from "./MyApplicationsView";

interface CaretakerProps {
  onNavigateToMessages?: () => void;
}

export function Caretaker({ onNavigateToMessages }: CaretakerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState("browse");

  const { careRequests, isLoading } = useCareRequests();
  const { myApplications } = useCareApplications();
  const { pets } = usePets();

  const filteredRequests = careRequests.filter(
    (request) =>
      request.status === "open" &&
      (request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.pet_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.pet_type?.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const hasUserApplied = (requestId: string) => {
    return myApplications.some((app) => app.request_id === requestId);
  };

  const getUserPets = () => {
    return pets || [];
  };

  if (showRequestForm) {
    return (
      <CareRequestForm
        onBack={() => setShowRequestForm(false)}
        userPets={getUserPets()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-cream/30 to-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/20 z-10">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                src="/pet_logo_1.png"
                alt="PawPal Logo"
                className="h-8 w-auto mr-3 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-coral to-pet-orange bg-clip-text text-transparent">
                  Caretaker
                </h1>
                <p className="text-sm text-muted-foreground">
                  Temporary pet care & sitting
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare
                className="w-6 h-6 text-primary-coral cursor-pointer hover:text-primary-coral/80 transition-colors"
                onClick={onNavigateToMessages}
              />
              <div className="text-2xl">🐕‍🦺</div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="my-requests">My Requests</TabsTrigger>
              <TabsTrigger value="my-applications">My Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-0">
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search care requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-border/20"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-2"
                >
                  <Filter className="w-3 h-3" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="my-requests" className="mt-0">
              <div className="text-center mb-4">
                <Button
                  onClick={() => setShowRequestForm(true)}
                  className="bg-gradient-to-r from-primary-coral to-pet-orange text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Care Request
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="my-applications" className="mt-0">
              <div className="text-center text-muted-foreground text-sm mb-4">
                Track your caretaker applications
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          <TabsContent value="browse" className="mt-0">
            {/* Browse Care Requests */}
            {isLoading ? (
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
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐕‍🦺</div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery
                    ? "No care requests found"
                    : "No care requests yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Be the first to create a care request for your pet!"}
                </p>
                <Button
                  onClick={() => setShowRequestForm(true)}
                  className="bg-gradient-to-r from-primary-coral to-pet-orange text-white"
                >
                  Create Care Request
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={request.owner_avatar_url} />
                            <AvatarFallback className="bg-primary-coral/10 text-primary-coral">
                              {request.owner_name?.[0] || "O"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {request.owner_name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {request.location}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {request.applications_count || 0} applications
                        </Badge>
                      </div>

                      {/* Pet Info */}
                      <div className="flex items-center gap-3 mb-3">
                        {request.pet_image_url && (
                          <img
                            src={request.pet_image_url}
                            alt={request.pet_name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-base">
                            {request.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.pet_name} • {request.pet_type}
                          </p>
                        </div>
                      </div>

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
                              {formatDuration(
                                request.start_date,
                                request.end_date
                              )}
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

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedRequest(request.id)}
                          disabled={hasUserApplied(request.id)}
                        >
                          {hasUserApplied(request.id) ? "Applied" : "Apply"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onNavigateToMessages}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-requests" className="mt-0">
            <MyRequestsView />
          </TabsContent>

          <TabsContent value="my-applications" className="mt-0">
            <MyApplicationsView />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button for Browse Tab */}
      {activeSubTab === "browse" && (
        <Button
          onClick={() => setShowRequestForm(true)}
          size="lg"
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-primary-coral to-pet-orange text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-30"
          aria-label="Create care request"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      {/* Care Application Modal */}
      {selectedRequest && (
        <CareApplicationModal
          requestId={selectedRequest}
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}
