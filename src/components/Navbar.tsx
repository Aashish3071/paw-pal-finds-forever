import { useState } from "react";
import {
  PawPrint,
  Search,
  MessageCircle,
  PlusCircle,
  User,
  Heart,
  Settings,
  LogOut,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/useProfile";
import { useSavedPets } from "@/hooks/usePets";
import { localDb } from "@/lib/localDb";
import { useToast } from "@/hooks/use-toast";
import { TabType } from "./BottomNavigation";

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onCreateListing: () => void;
  unreadCount?: number;
  onOpenSettings?: () => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  onCreateListing,
  unreadCount = 0,
  onOpenSettings,
}: NavbarProps) {
  const { profile } = useProfile();
  const { savedPets } = useSavedPets();
  const { toast } = useToast();

  const handleSwitchUser = (email: string, name: string) => {
    localDb.signIn(email);
    toast({
      title: "Switched User",
      description: `Now logged in as ${name}`,
    });
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group select-none"
          onClick={() => onTabChange("pets")}
        >
          <div className="relative">
            <img
              src="/pet_logo_1.png"
              alt="PawPal Logo"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-primary-coral via-pet-orange to-primary-coral bg-clip-text text-transparent">
                PawPal
              </span>
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0 h-4 bg-primary-coral/10 text-primary-coral border-0"
              >
                Adopt
              </Badge>
            </div>
            <span className="hidden sm:block text-[11px] text-muted-foreground font-medium -mt-0.5">
              Pet Adoption & Rehoming
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/30">
          {/* Adopt Tab */}
          <button
            onClick={() => onTabChange("pets")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "pets"
                ? "bg-background text-foreground shadow-xs scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Adopt</span>
          </button>

          {/* Messages Tab */}
          <button
            onClick={() => onTabChange("messages")}
            className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "messages"
                ? "bg-background text-foreground shadow-xs scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="bg-primary-coral text-white text-[10px] font-bold rounded-full px-1.5 py-0.2 min-w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => onTabChange("profile")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "profile"
                ? "bg-background text-foreground shadow-xs scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Account</span>
          </button>
        </nav>

        {/* Right Actions: Post Pet CTA + User Profile Dropdown */}
        <div className="flex items-center gap-3">
          {/* List a Pet CTA Button */}
          <Button
            size="sm"
            onClick={onCreateListing}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-primary-coral to-pet-orange text-white font-bold text-xs shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">List a Pet</span>
            <span className="sm:hidden">List</span>
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 rounded-xl flex items-center gap-2 hover:bg-muted/60"
              >
                <Avatar className="h-7 w-7 ring-1 ring-primary-coral/30">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary-coral/10 text-primary-coral font-bold text-xs">
                    {profile?.name?.charAt(0).toUpperCase() || "🐾"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline text-xs font-semibold text-foreground max-w-[100px] truncate">
                  {profile?.name || "My Account"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl border-border/30">
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-xs font-bold text-foreground">{profile?.name || "Pet Lover"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{profile?.email || "alex@pawpal.com"}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="rounded-xl text-xs cursor-pointer py-2 gap-2 font-medium"
                onClick={() => onTabChange("profile")}
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span>My Profile & Listings</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="rounded-xl text-xs cursor-pointer py-2 gap-2 font-medium"
                onClick={() => onTabChange("messages")}
              >
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <span>Inbox Messages</span>
              </DropdownMenuItem>

              {onOpenSettings && (
                <DropdownMenuItem
                  className="rounded-xl text-xs cursor-pointer py-2 gap-2 font-medium"
                  onClick={onOpenSettings}
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Switch Demo User
              </DropdownMenuLabel>

              <DropdownMenuItem
                className="rounded-xl text-xs cursor-pointer py-1.5 gap-2"
                onClick={() => handleSwitchUser("alex@pawpal.com", "Alex Sharma")}
              >
                <span>🐶 Alex Sharma (Adopter)</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="rounded-xl text-xs cursor-pointer py-1.5 gap-2"
                onClick={() => handleSwitchUser("priya@gmail.com", "Priya Verma")}
              >
                <span>🐱 Priya Verma (Pet Owner)</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="rounded-xl text-xs cursor-pointer py-2 gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 font-semibold"
                onClick={() => {
                  localDb.signOut();
                  window.location.reload();
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
