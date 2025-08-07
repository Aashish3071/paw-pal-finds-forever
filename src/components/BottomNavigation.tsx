import { Home, User, Heart, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  activeTab: "community" | "pets" | "caretaker" | "profile";
  onTabChange: (tab: "community" | "pets" | "caretaker" | "profile") => void;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  const tabs = [
    { id: "pets" as const, icon: Home, label: "Pets" },
    { id: "community" as const, icon: Heart, label: "Community" },
    { id: "caretaker" as const, icon: UserCheck, label: "Caretaker" },
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
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "opacity-100" : "opacity-70"
                }`}
              >
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
