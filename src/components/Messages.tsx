import { Search, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    user: {
      name: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b830?w=150",
    },
    lastMessage: "Hi! Is Buddy still available for adoption?",
    time: "2m ago",
    unreadCount: 2,
    petName: "Buddy"
  },
  {
    id: "2", 
    user: {
      name: "Arjun Patel",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
    lastMessage: "Thank you for considering Luna! She's very friendly.",
    time: "1h ago",
    unreadCount: 0,
    petName: "Luna"
  },
  {
    id: "3",
    user: {
      name: "Sneha Singh", 
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    },
    lastMessage: "Can we schedule a meet and greet this weekend?",
    time: "3h ago",
    unreadCount: 1,
    petName: "Max"
  }
];

export function Messages() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/20 z-10">
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Messages</h1>
              <p className="text-sm text-muted-foreground">Chat with adopters & shelters</p>
            </div>
            <MessageCircle className="w-6 h-6 text-primary-coral" />
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 border-border/20"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-md mx-auto p-4">
        {mockConversations.length > 0 ? (
          <div className="space-y-3">
            {mockConversations.map((conversation, index) => (
              <Card 
                key={conversation.id}
                className="border-border/20 hover:shadow-card cursor-pointer transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-primary-coral/20">
                      <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                      <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground truncate">
                          {conversation.user.name}
                        </p>
                        <div className="flex items-center gap-2">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {conversation.time}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {conversation.lastMessage}
                      </p>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-primary-coral font-medium">
                          About: {conversation.petName}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No messages yet
            </h3>
            <p className="text-muted-foreground">
              Start conversations by showing interest in pets or responding to adoption inquiries
            </p>
          </div>
        )}
      </div>
    </div>
  );
}