import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useChatPersistence } from "@/hooks/useChatPersistence";
import { useApiWarmup } from "@/hooks/useApiWarmup";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInputBox } from "@/components/ChatInputBox";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { RocLogo } from "@/components/RocLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ModeSelector } from "@/components/ModeSelector";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft, Plus, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Chat = () => {
  useApiWarmup();

  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    renameConversation,
    mode,
    setMode,
    regenerateImage,
    editImage,
    isEditingImage,
  } = useChatPersistence(user?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Track scroll position for scroll-to-bottom button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const suggestions = [
    { icon: "💡", text: "Explain a complex topic simply" },
    { icon: "✍️", text: "Help me write a professional email" },
    { icon: "🖼️", text: "Create an image prompt for a futuristic city" },
    { icon: "💻", text: "Write a React component for me" },
  ];

  if (authLoading || isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <RocLogo size="lg" className="animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="flex h-screen bg-background relative">
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
          onRename={renameConversation}
          onClose={() => setSidebarOpen(false)}
          onSignOut={handleSignOut}
          isOpen={sidebarOpen}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
          {/* Header - minimal, clean */}
          <header className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm flex-shrink-0 z-10">
            <div className="flex items-center gap-2 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeft className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startNewConversation()}
                className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                title="New chat"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Link to="/" className="flex items-center gap-1.5 min-w-0">
                <RocLogo size="sm" />
                <span className="font-display font-semibold text-base gradient-text truncate">
                  Roc AI
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <ModeSelector mode={mode} onModeChange={setMode} />
              <ThemeToggle />
            </div>
          </header>

          {/* Messages Area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
            {messages.length === 0 ? (
              /* Empty State - ChatGPT style centered */
              <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center w-full max-w-2xl px-2"
                >
                  <RocLogo size="lg" className="mx-auto mb-6" />
                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-foreground">
                    How can I help you today?
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mb-8">
                    Your AI assistant for writing, creativity, coding, and research.
                  </p>

                  {/* Suggestion Cards - ChatGPT grid style */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => sendMessage(suggestion.text)}
                        className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-card/50 hover:bg-card hover:border-border text-left text-sm text-foreground/80 hover:text-foreground transition-all duration-200"
                      >
                        <span className="text-lg leading-none mt-0.5">{suggestion.icon}</span>
                        <span className="leading-snug">{suggestion.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              /* Messages - ChatGPT style centered column */
              <div className="pb-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
                    timestamp={message.timestamp}
                    onRegenerateImage={regenerateImage}
                    onEditImage={editImage}
                    isEditingImage={isEditingImage}
                    onSuggestionClick={(suggestion) => sendMessage(suggestion)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={scrollToBottom}
                className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 h-8 w-8 rounded-full border border-border bg-background/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowDown className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <ChatInputBox
            onSend={(message, files) => sendMessage(message, files)}
            onClear={startNewConversation}
            isLoading={isLoading}
            hasMessages={messages.length > 0}
          />
        </div>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[999] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default Chat;
