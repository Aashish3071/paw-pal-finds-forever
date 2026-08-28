import { Search, MessageCircle, User } from "lucide-react";

export type TabType = "pets" | "post" | "messages" | "profile";

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadCount?: number;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  unreadCount = 0,
}: BottomNavigationProps) {
  return (
    <div className="fixed bottom-4 left-6 right-6 z-50 md:hidden max-w-xs mx-auto">
      <nav className="bg-background/90 backdrop-blur-xl border border-border/40 shadow-2xl rounded-full px-4 py-2 flex items-center justify-around gap-2 ring-1 ring-black/5">
        {/* Adopt / Browse Tab */}
        <button
          onClick={() => onTabChange("pets")}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === "pets"
              ? "text-primary-coral font-bold bg-primary-coral/10 scale-105"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Adopt</span>
        </button>

        {/* Chats / Messages Tab */}
        <button
          onClick={() => onTabChange("messages")}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === "messages"
              ? "text-primary-coral font-bold bg-primary-coral/10 scale-105"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Chats</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === "profile"
              ? "text-primary-coral font-bold bg-primary-coral/10 scale-105"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </nav>
    </div>
  );
}


