import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Navbar } from "@/components/Navbar";
import { BottomNavigation, TabType } from "@/components/BottomNavigation";
import { PetFeed } from "@/components/PetFeed";
import { MessagesUpdated } from "@/components/MessagesUpdated";
import { Profile } from "@/components/Profile";
import { PetListingForm } from "@/components/PetListingForm";
import { SettingsModal } from "@/components/SettingsModal";
import { useConversations } from "@/hooks/useConversations";

const LoadingMessages = [
  "Finding loving pets near you...",
  "Loading verified pet listings...",
  "Connecting adopters with pet owners...",
  "Welcome to PawPal...",
];

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("pets");
  const [showListingForm, setShowListingForm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState(0);

  const { conversations } = useConversations();

  // Total unread messages across conversations
  const totalUnreadCount = conversations.reduce(
    (acc, conv) => acc + (conv.unread_count || 0),
    0
  );

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
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleAuthSuccess = () => {
    // Auth state change will handle session update
  };

  const handleNavigateToMessages = (conversationId?: string) => {
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
    setShowListingForm(false);
    setActiveTab("messages");
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === "post") {
      setShowListingForm(true);
    } else {
      setShowListingForm(false);
      setActiveTab(tab);
    }
  };

  // Show loading splash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-beige via-soft-cream to-background overflow-hidden">
        <div className="text-center relative px-6">
          <img
            src="/pet_logo_1.png"
            alt="PawPal Logo"
            className="h-20 w-auto mx-auto mb-6 object-contain"
          />

          {/* Loading Animation */}
          <div className="flex items-center justify-center space-x-2.5 mb-6">
            <div className="w-3.5 h-3.5 bg-primary-coral rounded-full animate-bounce"></div>
            <div className="w-3.5 h-3.5 bg-primary-coral rounded-full animate-bounce delay-100"></div>
            <div className="w-3.5 h-3.5 bg-pet-orange rounded-full animate-bounce delay-200"></div>
          </div>

          <p className="text-foreground font-bold text-base transition-all duration-500 mb-1">
            {LoadingMessages[currentMessage]}
          </p>
          <p className="text-muted-foreground text-xs">
            Adopt & Rehome Pets 🐾
          </p>
        </div>
      </div>
    );
  }

  // Show welcome screen if not authenticated
  if (!session) {
    return <WelcomeScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Show listing form if user triggered create pet
  if (showListingForm) {
    return (
      <PetListingForm
        onBack={() => {
          setShowListingForm(false);
          setActiveTab("pets");
        }}
      />
    );
  }

  // Render main app tabs
  const renderActiveTab = () => {
    switch (activeTab) {
      case "pets":
        return (
          <PetFeed
            onCreateListing={() => setShowListingForm(true)}
            onNavigateToMessages={handleNavigateToMessages}
          />
        );
      case "messages":
        return (
          <MessagesUpdated
            initialConversationId={selectedConversationId}
            onBack={() => {
              setSelectedConversationId(null);
              setActiveTab("pets");
            }}
          />
        );
      case "profile":
        return (
          <Profile
            onNavigateToMessages={handleNavigateToMessages}
            onCreateListing={() => setShowListingForm(true)}
          />
        );
      default:
        return (
          <PetFeed
            onCreateListing={() => setShowListingForm(true)}
            onNavigateToMessages={handleNavigateToMessages}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreateListing={() => setShowListingForm(true)}
        unreadCount={totalUnreadCount}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      <div className="flex-1">
        {renderActiveTab()}
      </div>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        unreadCount={totalUnreadCount}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
};

export default Index;

