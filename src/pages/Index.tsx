import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PawPrints } from "@/components/PawPrints";
import { PetFeed } from "@/components/PetFeed";
import { Messages } from "@/components/Messages";
import { Profile } from "@/components/Profile";
import { PetListingForm } from "@/components/PetListingForm";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'pawprints' | 'messages' | 'profile'>('pawprints');
  const [showListingForm, setShowListingForm] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // The auth state change listener will handle the session update
    setIsLoading(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-beige to-soft-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-coral mx-auto mb-4"></div>
          <p className="text-warm-brown font-medium">Loading PawPal...</p>
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
      case 'home':
        return <PetFeed userRole="adopt" onCreateListing={() => setShowListingForm(true)} />;
      case 'pawprints':
        return <PawPrints />;
      case 'messages':
        return <Messages />;
      case 'profile':
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
