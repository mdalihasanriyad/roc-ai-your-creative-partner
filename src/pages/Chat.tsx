import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInputBox } from "@/components/ChatInputBox";
import { RocLogo } from "@/components/RocLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Chat = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = [
    "Write a professional email for a job application",
    "Explain React hooks in simple terms",
    "Create an image prompt for a futuristic city",
    "What are the best practices for REST API design?",
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border glass-card">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/" className="hidden md:block">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <RocLogo size="sm" />
            <span className="font-display font-bold text-lg gradient-text">
              Roc AI
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Powered by Lovable AI
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
                How can I help you today?
              </h1>
              <p className="text-muted-foreground mb-8">
                I'm Roc AI — your assistant for writing, coding, creativity, and research.
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
        onClear={clearMessages}
        isLoading={isLoading}
        hasMessages={messages.length > 0}
      />
    </div>
  );
};

export default Chat;
