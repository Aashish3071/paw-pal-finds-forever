import { useState } from "react";
import { Search, MessageCircle, ArrowLeft } from "lucide-react";
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

export function MessagesUpdated() {
  const { conversations, isLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithPet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.other_user.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  if (selectedConversation) {
    return (
      <ChatInterface
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/20 z-10">
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Messages</h1>
              <p className="text-sm text-muted-foreground">
                Chat with adopters & shelters
              </p>
            </div>
            <MessageCircle className="w-6 h-6 text-primary-coral" />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 border-border/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-md mx-auto p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No conversations yet
            </h3>
            <p className="text-muted-foreground">
              Start chatting with pet owners to see your conversations here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="border-border/20 hover:shadow-card transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Pet Image */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                        {conversation.pet.image_urls?.[0] ? (
                          <img
                            src={conversation.pet.image_urls[0]}
                            alt={conversation.pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            🐾
                          </div>
                        )}
                      </div>

                      {/* Other user avatar - small overlay */}
                      <Avatar className="absolute -bottom-1 -right-1 w-6 h-6 border-2 border-background">
                        <AvatarImage src={conversation.other_user.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {conversation.other_user.name
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {conversation.pet.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {conversation.last_message && (
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(
                                conversation.last_message.created_at
                              )}
                            </span>
                          )}
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-primary-coral text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 rounded-full">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-1">
                        with {conversation.other_user.name}
                      </p>

                      {conversation.last_message && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
