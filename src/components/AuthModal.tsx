import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PawPrint, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onAuthSuccess: () => void;
}

export const AuthModal = ({ isOpen, onClose, mode: initialMode, onAuthSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: name,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      }

      onAuthSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    setMode(initialMode);
    onClose();
  };

  const switchMode = () => {
    resetForm();
    setMode(mode === 'signup' ? 'login' : 'signup');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl border-0 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <PawPrint className="w-8 h-8 text-primary-coral mr-2" />
            <DialogTitle className="text-2xl font-bold text-warm-brown">
              {mode === 'signup' ? 'Join PawPal' : 'Welcome Back'}
            </DialogTitle>
          </div>
          <p className="text-warm-brown/70">
            {mode === 'signup' 
              ? 'Create your account to start connecting with pets' 
              : 'Sign in to continue your pet journey'
            }
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-warm-brown font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="h-12 rounded-xl border-warm-brown/20 focus:border-primary-coral"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-warm-brown font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="h-12 rounded-xl border-warm-brown/20 focus:border-primary-coral"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-warm-brown font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
                className="h-12 rounded-xl border-warm-brown/20 focus:border-primary-coral pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-warm-brown/50" />
                ) : (
                  <Eye className="w-4 h-4 text-warm-brown/50" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary-coral to-pet-orange text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Please wait...</span>
              </div>
            ) : (
              <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
            )}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-warm-brown/10">
          <p className="text-warm-brown/70 text-sm">
            {mode === 'signup' 
              ? 'Already have an account?' 
              : "Don't have an account?"
            }
            <Button
              type="button"
              variant="link"
              onClick={switchMode}
              className="text-primary-coral hover:text-primary-coral/80 font-medium p-0 ml-1 h-auto"
            >
              {mode === 'signup' ? 'Sign In' : 'Join PawPal'}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};