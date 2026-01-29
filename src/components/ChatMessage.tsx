import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Message } from "@/hooks/useChat";
import { RocLogo } from "./RocLogo";
import { User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage = ({ message, isStreaming }: ChatMessageProps) => {
  const isUser = message.role === "user";

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
          {isUser ? (
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
                {message.content || (isStreaming ? "..." : "")}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
