import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/AuthModal";
import { Heart, PawPrint, MapPin } from "lucide-react";

interface WelcomeScreenProps {
  onAuthSuccess: () => void;
}

export const WelcomeScreen = ({ onAuthSuccess }: WelcomeScreenProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleJoinPawPal = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handleLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-warm-cream to-background">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/welcome.png"
          alt="Two adorable puppies playing together"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-warm-cream/80 via-background/70 to-warm-cream/85" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col items-center justify-end min-h-screen px-6 py-8 pb-16 text-center">
        {/* Logo Animation */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <PawPrint className="w-10 h-10 text-primary-coral mr-2 animate-bounce" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              PawPal
            </h1>
          </div>
          <p className="text-base text-muted-foreground font-medium mb-3">
            Rehome. Adopt. Connect.
          </p>

          {/* Community Message */}
          <div className="bg-card/40 backdrop-blur-sm rounded-2xl px-4 py-3 mx-4 border border-border/20">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Join a loving community — share pet stories, moments, and make
              connections that go beyond adoption.
            </p>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-card/95 backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-2xl max-w-md w-full mx-auto mb-6 animate-scale-in border border-border/20">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Welcome to PawPal
            </h2>
            <p className="text-sm text-muted-foreground">
              Find your perfect companion or help a pet find their forever home
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleJoinPawPal}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary-coral to-pet-orange text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="mr-2">Join PawPal</span>
              <PawPrint className="w-4 h-4 group-hover:animate-bounce" />
            </Button>

            <Button
              onClick={handleLogin}
              variant="outline"
              className="w-full h-12 text-base font-semibold border-2 border-primary-coral text-primary-coral rounded-2xl hover:bg-primary-coral hover:text-white transition-all duration-300 hover:scale-105"
            >
              Log In
            </Button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="flex flex-row items-center justify-center space-x-4 text-muted-foreground mb-4">
          <div className="flex items-center space-x-1 bg-card/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <Heart className="w-4 h-4 text-primary-coral" />
            <span className="text-xs font-medium">100% Free</span>
          </div>
          <div className="flex items-center space-x-1 bg-card/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <PawPrint className="w-4 h-4 text-primary-coral" />
            <span className="text-xs font-medium">All pets welcome</span>
          </div>
          <div className="flex items-center space-x-1 bg-card/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <MapPin className="w-4 h-4 text-primary-coral" />
            <span className="text-xs font-medium">Local matches</span>
          </div>
        </div>

        {/* Footer Message */}
        <p className="text-xs text-muted-foreground/70 text-center">
          Made with ❤️ for pets and their humans
        </p>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onAuthSuccess={onAuthSuccess}
      />
    </div>
  );
};
