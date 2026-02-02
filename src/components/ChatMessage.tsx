import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Message } from "@/hooks/useChatPersistence";
import { User } from "lucide-react";
import { format } from "date-fns";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  timestamp?: string;
}

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-2">
    <motion.span
      className="w-2 h-2 rounded-full bg-primary"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
    />
    <motion.span
      className="w-2 h-2 rounded-full bg-primary"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
    />
    <motion.span
      className="w-2 h-2 rounded-full bg-primary"
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
    />
  </div>
);

export const ChatMessage = ({ message, isStreaming, timestamp }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const showTypingIndicator = isStreaming && !message.content;

  const formattedTime = timestamp 
    ? format(new Date(timestamp), "h:mm a")
    : format(new Date(), "h:mm a");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser
            ? "bg-muted"
            : "bg-gradient-to-br from-primary to-secondary"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-muted-foreground" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" className="fill-primary-foreground/20" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[85%] md:max-w-[75%] ${
          isUser ? "text-right" : ""
        }`}
      >
        <div
          className={`inline-block rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
              : "glass-card"
          }`}
        >
          {/* Image attachments for user messages */}
          {isUser && message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Attachment ${index + 1}`}
                  className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                />
              ))}
            </div>
          )}
          {showTypingIndicator ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-foreground">{children}</li>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-primary">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-muted p-3 rounded-lg text-sm overflow-x-auto my-2">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <pre className="bg-transparent p-0">{children}</pre>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  a: ({ children, href }) => (
                    <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content || ""}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {/* Timestamp */}
        <p className={`text-xs text-muted-foreground mt-1 ${isUser ? "text-right" : "text-left"}`}>
          {formattedTime}
        </p>
      </div>
    </motion.div>
  );
};
