import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  useMessages,
  MESSAGE_TEMPLATES,
  ConversationWithPet,
} from "@/hooks/useConversations";
import { usePets } from "@/hooks/usePets";
import { supabase } from "@/integrations/supabase/client";

interface ChatInterfaceProps {
  conversation: ConversationWithPet;
  onBack: () => void;
}

export function ChatInterface({ conversation, onBack }: ChatInterfaceProps) {
  const [messageText, setMessageText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage, isSending, markAsRead } =
    useMessages(conversation.id);
  const { markPetAsAdopted } = usePets();

  // Resolve current authenticated user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
      }
    });
  }, []);

  const isOwner = conversation.owner_id === currentUserId;
  const templateType = isOwner ? "owner" : "adopter";
  const quickTemplates = MESSAGE_TEMPLATES[templateType] || [];

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Mark unread messages as read
    if (!currentUserId) return;
    const unreadMessages = messages
      .filter((msg) => msg.sender_id !== currentUserId && !msg.read_at)
      .map((msg) => msg.id);

    if (unreadMessages.length > 0) {
      markAsRead(unreadMessages);
    }
  }, [messages, currentUserId, markAsRead]);

  const handleSendMessage = () => {
    if (!messageText.trim() || isSending) return;

    sendMessage({
      conversation_id: conversation.id,
      content: messageText.trim(),
    });
    setMessageText("");
    setShowTemplates(false);
  };

  const handleTemplateSelect = (templateObj: any) => {
    const personalizedTemplate = templateObj.template
      .replace("{petName}", conversation.pet?.name || "the pet")
      .replace("{petType}", conversation.pet?.type || "pet");

    sendMessage({
      conversation_id: conversation.id,
      content: personalizedTemplate,
      message_type: "template",
    });
    setShowTemplates(false);
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
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
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
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/30 z-20 shadow-xs">
        <div className="max-w-md mx-auto p-3.5 space-y-2">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9 ring-1 ring-primary-coral/30">
                  <AvatarImage src={conversation.other_user?.avatar_url} />
                  <AvatarFallback className="bg-primary-coral/10 text-primary-coral font-bold text-xs">
                    {conversation.other_user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-sm text-foreground leading-tight">
                    {conversation.other_user?.name || "Pet Owner / Adopter"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {isOwner ? "Interested Adopter" : "Pet Owner"}
                  </p>
                </div>
              </div>
            </div>

            {/* Pet Status / Action */}
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] rounded-lg border-primary-coral/30 text-primary-coral"
                onClick={() => markPetAsAdopted(conversation.pet_id)}
              >
                Mark Adopted
              </Button>
            )}
          </div>

          {/* Dedicated Pet Context Banner (OLX Item Header) */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted/60 flex-shrink-0">
                {petImage ? (
                  <img
                    src={petImage}
                    alt={conversation.pet?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">
                    🐾
                  </div>
                )}
              </div>
              <div className="leading-tight">
                <span className="text-xs font-bold text-foreground block">
                  {conversation.pet?.name || "Pet Inquiry"}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {conversation.pet?.type || "Adoption"} • {conversation.pet?.name ? "Available" : ""}
                </span>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] font-semibold h-5 bg-emerald-500/10 text-emerald-600 border-0">
              Active Listing
            </Badge>
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
