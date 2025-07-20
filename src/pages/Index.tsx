import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PawPrints } from "@/components/PawPrints";
import { PetFeed } from "@/components/PetFeed";
import { Messages } from "@/components/Messages";
import { Profile } from "@/components/Profile";
import { PetListingForm } from "@/components/PetListingForm";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'pawprints' | 'messages' | 'profile'>('pawprints');
  const [showListingForm, setShowListingForm] = useState(false);

  if (showListingForm) {
    return <PetListingForm onBack={() => setShowListingForm(false)} />;
  }

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
