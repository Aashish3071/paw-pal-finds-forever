import { Home, MessageCircle, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";

interface BottomNavigationProps {
  activeTab: "home" | "pawprints" | "messages" | "profile";
  onTabChange: (tab: "home" | "pawprints" | "messages" | "profile") => void;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  const { unreadCount } = useNotifications();

  const tabs = [
    { id: "home" as const, icon: Home, label: "Home" },
    { id: "pawprints" as const, icon: Heart, label: "PawPrints" },
    { id: "messages" as const, icon: MessageCircle, label: "Messages" },
    { id: "profile" as const, icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-around p-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary-coral/10 text-primary-coral"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`}
                />
                {tab.id === "messages" && unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-4 rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "opacity-100" : "opacity-70"
                }`}
              >
                {tab.id === "pawprints" ? "🐾" : tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
