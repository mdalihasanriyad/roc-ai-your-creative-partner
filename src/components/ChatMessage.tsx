import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Message } from "@/hooks/useChatPersistence";
import { User, Copy, Check, Download } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

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
  const [copied, setCopied] = useState(false);

  const formattedTime = timestamp 
    ? format(new Date(timestamp), "h:mm a")
    : format(new Date(), "h:mm a");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleDownloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch (err) {
      toast.error("Failed to download image");
    }
  };

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
          className={`group relative inline-block rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
              : "glass-card"
          }`}
        >
          {/* Copy button for AI messages */}
          {!isUser && message.content && !isStreaming && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
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
              {/* Generated images */}
              {message.generatedImages && message.generatedImages.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {message.generatedImages.map((img, index) => (
                    <div key={index} className="relative group/image">
                      <a
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={img}
                          alt={`Generated image ${index + 1}`}
                          className="max-w-[400px] max-h-[400px] rounded-lg object-cover border border-border hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      </a>
                      <button
                        onClick={() => handleDownloadImage(img, index)}
                        className="absolute bottom-2 right-2 p-2 rounded-md bg-background/80 backdrop-blur-sm opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-background text-foreground shadow-md"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
