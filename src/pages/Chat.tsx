import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useChatPersistence } from "@/hooks/useChatPersistence";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInputBox } from "@/components/ChatInputBox";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { RocLogo } from "@/components/RocLogo";
import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Chat = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    isLoadingConversations,
    sendMessage,
    selectConversation,
    startNewConversation,
    deleteConversation,
  } = useChatPersistence(user?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const suggestions = [
    "Write a professional email for a job application",
    "Explain React hooks in simple terms",
    "Create an image prompt for a futuristic city",
    "What are the best practices for REST API design?",
  ];

  if (authLoading || isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <RocLogo size="lg" className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        currentId={currentConversationId}
        onSelect={(id) => {
          selectConversation(id);
          setSidebarOpen(false);
        }}
        onNew={() => {
          startNewConversation();
          setSidebarOpen(false);
        }}
        onDelete={deleteConversation}
        onClose={() => setSidebarOpen(false)}
        onSignOut={handleSignOut}
        isOpen={sidebarOpen}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border glass-card">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex gap-2"
            >
              <Menu className="h-4 w-4" />
              History
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <RocLogo size="sm" />
              <span className="font-display font-bold text-lg gradient-text">
                Roc AI
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">
              Powered by Roc AI
            </span>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-2xl"
              >
                <RocLogo size="lg" className="mx-auto mb-6" />
                <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">
                  How can I help you today !
                </h1>
                <p className="text-muted-foreground mb-8">
                  I'm Roc AI - your assistant for writing, creativity, coding, and research.
                </p>

                {/* Suggestion Pills */}
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(suggestion)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="line-clamp-1">{suggestion}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-4 space-y-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInputBox
          onSend={sendMessage}
          onClear={startNewConversation}
          isLoading={isLoading}
          hasMessages={messages.length > 0}
        />
      </div>
    </div>
  );
};

export default Chat;
