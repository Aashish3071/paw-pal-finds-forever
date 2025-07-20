import { useState } from "react";
import { RoleSelector } from "@/components/RoleSelector";
import { PetFeed } from "@/components/PetFeed";
import heroImage from "@/assets/hero-dog.jpg";

const Index = () => {
  const [userRole, setUserRole] = useState<'adopt' | 'rehome' | null>(null);

  if (!userRole) {
    return <RoleSelector onRoleSelect={setUserRole} />;
  }

  return <PetFeed userRole={userRole} />;
};

export default Index;
