import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Moon,
  Globe,
  Shield,
  HelpCircle,
  LogOut,
  Trash2,
  Heart,
  MessageSquare,
  Camera,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailUpdates: true,
    messageAlerts: true,
    adoptionAlerts: true,
    locationSharing: true,
  });

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [setting]: value }));
    toast({
      title: "Setting updated",
      description: `${setting} ${value ? "enabled" : "disabled"}`,
    });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Feature coming soon",
      description: "Account deletion will be available in a future update",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <img
              src="/pet_logo_1.png"
              alt="PawPal Logo"
              className="h-5 w-auto object-contain"
            />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-coral" />
              <h3 className="font-semibold">Notifications</h3>
            </div>

            <div className="space-y-3 ml-7">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm">
                  Push notifications
                </Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(value) =>
                    handleSettingChange("notifications", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="messageAlerts" className="text-sm">
                  Message alerts
                </Label>
                <Switch
                  id="messageAlerts"
                  checked={settings.messageAlerts}
                  onCheckedChange={(value) =>
                    handleSettingChange("messageAlerts", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="adoptionAlerts" className="text-sm">
                  Adoption updates
                </Label>
                <Switch
                  id="adoptionAlerts"
                  checked={settings.adoptionAlerts}
                  onCheckedChange={(value) =>
                    handleSettingChange("adoptionAlerts", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="emailUpdates" className="text-sm">
                  Email updates
                </Label>
                <Switch
                  id="emailUpdates"
                  checked={settings.emailUpdates}
                  onCheckedChange={(value) =>
                    handleSettingChange("emailUpdates", value)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Privacy Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-coral" />
              <h3 className="font-semibold">Privacy</h3>
            </div>

            <div className="space-y-3 ml-7">
              <div className="flex items-center justify-between">
                <Label htmlFor="locationSharing" className="text-sm">
                  Share location for matches
                </Label>
                <Switch
                  id="locationSharing"
                  checked={settings.locationSharing}
                  onCheckedChange={(value) =>
                    handleSettingChange("locationSharing", value)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary-coral" />
              <h3 className="font-semibold">Appearance</h3>
            </div>

            <div className="space-y-3 ml-7">
              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode" className="text-sm">
                  Dark mode
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                  <Switch
                    id="darkMode"
                    checked={settings.darkMode}
                    onCheckedChange={(value) =>
                      handleSettingChange("darkMode", value)
                    }
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Support Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary-coral" />
              <h3 className="font-semibold">Support</h3>
            </div>

            <div className="space-y-2 ml-7">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2"
              >
                Help Center
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2"
              >
                Contact Support
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2"
              >
                Privacy Policy
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-auto py-2"
              >
                Terms of Service
              </Button>
            </div>
          </div>

          <Separator />

          {/* Account Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>

            <Button
              onClick={handleDeleteAccount}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>

          {/* App Info */}
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">PawPal v1.0.0</p>
            <p className="text-xs text-muted-foreground">
              Made with ❤️ for pets
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
