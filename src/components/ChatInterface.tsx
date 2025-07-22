import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, MoreVertical, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useMessages,
  MESSAGE_TEMPLATES,
  ConversationWithPet,
} from "@/hooks/useConversations";
import { usePets } from "@/hooks/usePets";

interface ChatInterfaceProps {
  conversation: ConversationWithPet;
  onBack: () => void;
}

export function ChatInterface({ conversation, onBack }: ChatInterfaceProps) {
  const [messageText, setMessageText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, isSending, markAsRead } =
    useMessages(conversation.id);
  const { markPetAsAdopted } = usePets();

  const currentUserId = ""; // We'll get this from auth context
  const isOwner = conversation.owner_id === currentUserId;
  const templateType = isOwner ? "owner" : "adopter";

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Mark unread messages as read
    const unreadMessages = messages
      .filter((msg) => msg.sender_id !== currentUserId && !msg.read_at)
      .map((msg) => msg.id);

    if (unreadMessages.length > 0) {
      markAsRead(unreadMessages);
    }
  }, [messages, currentUserId, markAsRead]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    sendMessage({
      conversation_id: conversation.id,
      content: messageText.trim(),
    });
    setMessageText("");
    setShowTemplates(false);
  };

  const handleTemplateSelect = (templateObj: any) => {
    const personalizedTemplate = templateObj.template
      .replace("{petName}", conversation.pet.name)
      .replace("{petType}", conversation.pet.type);

    sendMessage({
      conversation_id: conversation.id,
      content: personalizedTemplate,
      message_type: "template",
    });
    setShowTemplates(false);
  };

  const handleMarkAsAdopted = () => {
    markPetAsAdopted(conversation.pet_id);
    // You might want to also update the conversation status
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: any, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/20 z-10">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                  {conversation.pet.image_urls?.[0] ? (
                    <img
                      src={conversation.pet.image_urls[0]}
                      alt={conversation.pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      🐾
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="font-semibold text-foreground">
                    {conversation.pet.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    with {conversation.other_user.name}
                  </p>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem onClick={handleMarkAsAdopted}>
                    Mark as Adopted
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>Block User</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-md mx-auto space-y-4">
          {Object.entries(groupedMessages).map(
            ([date, dayMessages]: [string, any]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="text-center py-2">
                  <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {formatMessageDate(date)}
                  </span>
                </div>

                {/* Messages for this date */}
                {dayMessages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.sender_id === currentUserId
                          ? "bg-primary-coral text-white"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_id === currentUserId
                            ? "text-white/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Templates */}
      {showTemplates && (
        <div className="bg-background border-t border-border/20 p-4">
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-medium text-foreground mb-3">
              Quick Replies
            </h3>
            <div className="grid gap-2">
              {MESSAGE_TEMPLATES[templateType].map((templateObj, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left h-auto p-3 whitespace-normal"
                  onClick={() => handleTemplateSelect(templateObj)}
                >
                  <div className="text-left">
                    <div className="font-medium text-xs text-primary-coral mb-1">
                      {templateObj.button}
                    </div>
                    <div className="text-sm">
                      {templateObj.template
                        .replace("{petName}", conversation.pet.name)
                        .replace("{petType}", conversation.pet.type)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border/20 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className={showTemplates ? "bg-primary-coral/10" : ""}
            >
              Templates
            </Button>

            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || isSending}
                size="icon"
                className="bg-primary-coral hover:bg-primary-coral/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
