import { useState, useEffect } from "react";
import { Search, MessageCircle, ArrowLeft, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useConversations,
  ConversationWithPet,
} from "@/hooks/useConversations";
import { ChatInterface } from "./ChatInterface";

interface MessagesUpdatedProps {
  onBack?: () => void;
  initialConversationId?: string | null;
}

export function MessagesUpdated({ onBack, initialConversationId }: MessagesUpdatedProps = {}) {
  const { conversations, isLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithPet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // If initialConversationId is provided, auto-select that conversation when loaded
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const found = conversations.find((c) => c.id === initialConversationId);
      if (found) {
        setSelectedConversation(found);
      }
    } else if (!selectedConversation && conversations.length > 0 && window.innerWidth >= 768) {
      // On desktop, auto-select first conversation
      setSelectedConversation(conversations[0]);
    }
  }, [initialConversationId, conversations]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.pet?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.other_user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "now";
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return `${Math.floor(diffDays / 7)}w`;
  };

  // Mobile Single-Pane View (when conversation is active on mobile screen)
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile: Full Screen Chat when selected */}
      <div className="md:hidden">
        {selectedConversation ? (
          <ChatInterface
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="pb-24">
            {/* Mobile Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/30 z-10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {onBack && (
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 rounded-full">
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <h1 className="text-xl font-black text-foreground">Messages</h1>
                </div>
                <Badge variant="secondary" className="text-xs font-bold">
                  {conversations.length} {conversations.length === 1 ? "chat" : "chats"}
                </Badge>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  className="pl-10 h-10 rounded-xl bg-muted/40 border-border/30 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile Conversation List */}
            <div className="p-4 space-y-2.5">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted/40 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="text-5xl">💬🐾</div>
                  <h3 className="font-bold text-base text-foreground">No conversations yet</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Browse pet listings and click "Chat with Owner" to start a direct message thread.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className="p-3.5 rounded-2xl border border-border/30 bg-card hover:border-primary-coral/40 cursor-pointer transition-all shadow-xs flex items-center gap-3"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted">
                        {conv.pet?.image_urls?.[0] ? (
                          <img
                            src={conv.pet.image_urls[0]}
                            alt={conv.pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🐾</div>
                        )}
                      </div>
                      <Avatar className="absolute -bottom-1 -right-1 w-5 h-5 border-2 border-background">
                        <AvatarImage src={conv.other_user?.avatar_url} />
                        <AvatarFallback className="text-[9px] bg-primary-coral text-white font-bold">
                          {conv.other_user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-bold text-sm text-foreground truncate">
                          {conv.pet?.name || "Pet"} • {conv.other_user?.name}
                        </h3>
                        {conv.last_message && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {formatTimeAgo(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.last_message?.content || "No messages yet"}
                      </p>
                    </div>

                    {conv.unread_count > 0 && (
                      <Badge className="bg-primary-coral text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center p-0">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Split-Pane Layout (Sidebar + Chat View) */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] gap-6">
        {/* Left Sidebar: Conversations Inbox */}
        <div className="w-80 lg:w-96 flex flex-col bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border/30 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-foreground">Messages</h2>
              <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">
                {conversations.length}
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 h-9 rounded-xl bg-background border-border/40 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-muted/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2">
                <div className="text-4xl">💬</div>
                <p className="text-xs font-semibold text-foreground">No conversations</p>
                <p className="text-[11px] text-muted-foreground">
                  Inquiries from adopters will appear here.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                      isSelected
                        ? "bg-primary-coral/10 border-primary-coral/40 shadow-xs"
                        : "border-transparent hover:bg-muted/40"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-muted">
                        {conv.pet?.image_urls?.[0] ? (
                          <img
                            src={conv.pet.image_urls[0]}
                            alt={conv.pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">🐾</div>
                        )}
                      </div>
                      <Avatar className="absolute -bottom-1 -right-1 w-4.5 h-4.5 border-2 border-background">
                        <AvatarImage src={conv.other_user?.avatar_url} />
                        <AvatarFallback className="text-[8px] bg-primary-coral text-white font-bold">
                          {conv.other_user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-bold text-xs text-foreground truncate">
                          {conv.pet?.name} • {conv.other_user?.name}
                        </h4>
                        {conv.last_message && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {formatTimeAgo(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {conv.last_message?.content || "No messages yet"}
                      </p>
                    </div>

                    {conv.unread_count > 0 && (
                      <Badge className="bg-primary-coral text-white text-[10px] h-4 w-4 rounded-full flex items-center justify-center p-0">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Active Chat or Empty Placeholder */}
        <div className="flex-1 bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm flex flex-col">
          {selectedConversation ? (
            <ChatInterface
              conversation={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-muted/10">
              <div className="w-16 h-16 rounded-full bg-primary-coral/10 flex items-center justify-center text-3xl text-primary-coral">
                💬
              </div>
              <h3 className="font-bold text-lg text-foreground">Select a conversation</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Choose a chat from the left panel to discuss adoption details, meet-and-greets, or pet health records.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

