import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/AuthModal";
import { Heart, PawPrint, MapPin } from "lucide-react";

interface WelcomeScreenProps {
  onAuthSuccess: () => void;
}

export const WelcomeScreen = ({ onAuthSuccess }: WelcomeScreenProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleJoinPawPal = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-warm-beige to-soft-cream">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-warm-beige/80 to-soft-cream/60" />
        <img 
          src="/lovable-uploads/6fd508f1-8044-4e14-a090-bb9b5746e401.png"
          alt="Cute pets playing"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Logo Animation */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <PawPrint className="w-12 h-12 text-primary-coral mr-3 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-bold text-warm-brown">
              PawPal
            </h1>
          </div>
          <p className="text-lg text-warm-brown/80 font-medium">
            Rehome. Adopt. Connect.
          </p>
        </div>

        {/* Welcome Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md w-full mx-auto mb-8 animate-scale-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-warm-brown mb-2">
              Welcome to PawPal
            </h2>
            <p className="text-warm-brown/70">
              Find your perfect companion or help a pet find their forever home
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleJoinPawPal}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary-coral to-pet-orange text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="mr-2">Join PawPal</span>
              <PawPrint className="w-5 h-5 group-hover:animate-bounce" />
            </Button>
            
            <Button
              onClick={handleLogin}
              variant="outline"
              className="w-full h-14 text-lg font-semibold border-2 border-primary-coral text-primary-coral rounded-2xl hover:bg-primary-coral hover:text-white transition-all duration-300 hover:scale-105"
            >
              Log In
            </Button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-warm-brown/80">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-primary-coral" />
            <span className="font-medium">100% Free</span>
          </div>
          <div className="flex items-center space-x-2">
            <PawPrint className="w-5 h-5 text-primary-coral" />
            <span className="font-medium">All pets welcome</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary-coral" />
            <span className="font-medium">Local matches</span>
          </div>
        </div>
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