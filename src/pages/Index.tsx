import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PawPrints } from "@/components/PawPrints";
import { PetFeed } from "@/components/PetFeed";
import { MessagesUpdated } from "@/components/MessagesUpdated";
import { Profile } from "@/components/Profile";
import { PetListingForm } from "@/components/PetListingForm";

const LoadingMessages = [
  "Finding perfect pet matches...",
  "Connecting loving hearts...",
  "Preparing adoption profiles...",
  "Setting up your pet journey...",
];

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "home" | "pawprints" | "messages" | "profile"
  >("pawprints");
  const [showListingForm, setShowListingForm] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cycle through messages while loading
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % LoadingMessages.length);
      }, 2000); // Change message every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleAuthSuccess = () => {
    // The auth state change listener will handle the session update automatically
    // No need to set loading again
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-beige to-soft-cream overflow-hidden">
        <div className="text-center relative">
          {/* Main Logo */}
          <img
            src="/pet_logo_1.png"
            alt="PawPal Logo"
            className="h-20 w-auto mx-auto mb-8 object-contain"
          />

          {/* Loading Animation */}
          <div className="relative w-60 h-32 mx-auto mb-6 flex items-center justify-center">
            {/* Paw Print Trail Animation */}
            <div className="flex space-x-3">
              <div className="w-4 h-4 bg-primary-coral rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-primary-coral rounded-full animate-bounce delay-100"></div>
              <div className="w-4 h-4 bg-primary-coral rounded-full animate-bounce delay-200"></div>
              <div className="w-4 h-4 bg-pet-orange rounded-full animate-bounce delay-300"></div>
            </div>
          </div>

          {/* Dynamic Loading Message */}
          <p className="text-warm-brown font-medium text-lg transition-all duration-500 mb-2">
            {LoadingMessages[currentMessage]}
          </p>
          <p className="text-warm-brown/70 text-sm">
            PawPal is getting ready for you 🐾
          </p>

          {/* Progress indicator */}
          <div className="mt-6 w-48 mx-auto">
            <div className="w-full bg-warm-brown/20 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-primary-coral to-pet-orange h-1.5 rounded-full animate-pulse"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome screen if not authenticated
  if (!session) {
    return <WelcomeScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Show listing form if needed
  if (showListingForm) {
    return <PetListingForm onBack={() => setShowListingForm(false)} />;
  }

  // Render main app tabs
  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return (
          <PetFeed
            userRole="adopt"
            onCreateListing={() => setShowListingForm(true)}
            onNavigateToMessages={() => setActiveTab("messages")}
          />
        );
      case "pawprints":
        return <PawPrints />;
      case "messages":
        return <MessagesUpdated />;
      case "profile":
        return <Profile />;
      default:
        return <PawPrints />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderActiveTab()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
