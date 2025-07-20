import { useState } from "react";
import { RoleSelector } from "@/components/RoleSelector";
import { PetFeed } from "@/components/PetFeed";
import { PetListingForm } from "@/components/PetListingForm";
import heroImage from "@/assets/hero-dog.jpg";

const Index = () => {
  const [userRole, setUserRole] = useState<'adopt' | 'rehome' | null>(null);
  const [showListingForm, setShowListingForm] = useState(false);

  if (!userRole) {
    return <RoleSelector onRoleSelect={setUserRole} />;
  }

  if (showListingForm) {
    return <PetListingForm onBack={() => setShowListingForm(false)} />;
  }

  return <PetFeed userRole={userRole} onCreateListing={() => setShowListingForm(true)} />;
};

export default Index;
