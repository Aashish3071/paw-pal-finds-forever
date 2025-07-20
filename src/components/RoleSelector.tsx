import { Heart, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleSelectorProps {
  onRoleSelect: (role: 'adopt' | 'rehome') => void;
}

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream via-background to-sky-blue-light flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary-coral to-pet-orange bg-clip-text text-transparent">
              PawPal
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Rehome. Adopt. Love.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-foreground/80">
            Choose your journey with us:
          </p>
          
          <div className="space-y-3">
            <Button
              variant="hero"
              size="lg"
              className="w-full h-16 text-lg"
              onClick={() => onRoleSelect('adopt')}
            >
              <Heart className="w-6 h-6" />
              I want to adopt a dog
            </Button>
            
            <Button
              variant="wishlist"
              size="lg"
              className="w-full h-16 text-lg"
              onClick={() => onRoleSelect('rehome')}
            >
              <Home className="w-6 h-6" />
              I need to rehome a dog
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>💝 Free to use • 🏠 Local connections • ❤️ Pet welfare first</p>
        </div>
      </div>
    </div>
  );
}