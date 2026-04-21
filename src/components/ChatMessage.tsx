import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Message } from "@/hooks/useChatPersistence";
import { Sparkles, User, Copy, Check, Download, RefreshCw, Pencil, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ImageEditDialog } from "./ImageEditDialog";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  timestamp?: string;
  onRegenerateImage?: (prompt: string) => void;
  onEditImage?: (imageUrl: string, instruction: string) => void;
  isEditingImage?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

export const ChatMessage = ({
  message,
  isStreaming,
  timestamp,
  onRegenerateImage,
  onEditImage,
  isEditingImage,
  onSuggestionClick,
}: ChatMessageProps) => {
  const isUser = message.role === "user";
  const showTypingIndicator = isStreaming && !message.content;
  const isGeneratingImage = (isStreaming || isEditingImage) && !message.generatedImages?.length &&
    (message.content?.toLowerCase().includes("generat") || message.content?.toLowerCase().includes("creat") || message.content?.toLowerCase().includes("edit") || message.content === "");
  const [copied, setCopied] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedImageForEdit, setSelectedImageForEdit] = useState<string>("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isGeneratingImage) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isGeneratingImage]);

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

  const handleRegenerate = () => {
    const prompt = message.content.replace(/^(Here's your generated image:|I've generated|Here is)/i, "").trim() || "Regenerate this image";
    onRegenerateImage?.(prompt);
  };

  const handleEditClick = (imageUrl: string) => {
    setSelectedImageForEdit(imageUrl);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (instruction: string) => {
    if (selectedImageForEdit) {
      onEditImage?.(selectedImageForEdit, instruction);
      setEditDialogOpen(false);
    }
  };

  return (
    <TooltipProvider>
      <div className={`py-4 sm:py-6 ${isUser ? "bg-transparent" : "bg-muted/20"}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex gap-3 sm:gap-4"
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                isUser
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-gradient-to-br from-primary to-secondary"
              }`}
            >
              {isUser ? (
                <User className="w-3.5 h-3.5 text-primary" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-3.5 h-3.5"
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

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Role label */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground">
                  {isUser ? "You" : "Roc AI"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formattedTime}
                </span>
              </div>

              {/* Debug details for failed requests */}
              {!isUser && message.debug && (
                <details
                  className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 text-xs"
                  open
                >
                  <summary className="cursor-pointer select-none px-3 py-2 font-medium text-destructive flex flex-wrap items-center gap-2">
                    <span>🔍 Debug details</span>
                    {message.debug.status != null && (
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-destructive/10">
                        {message.debug.status} {message.debug.statusText}
                      </span>
                    )}
                    {message.debug.requestType && (
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {message.debug.requestType}
                      </span>
                    )}
                  </summary>
                  <div className="px-3 pb-3 space-y-1.5 text-muted-foreground font-mono">
                    {message.debug.mode && (
                      <div>
                        <span className="text-foreground/70">mode:</span> {message.debug.mode}
                      </div>
                    )}
                    {message.debug.durationMs != null && (
                      <div>
                        <span className="text-foreground/70">duration:</span>{" "}
                        {message.debug.durationMs}ms
                      </div>
                    )}
                    {message.debug.errorMessage && (
                      <div>
                        <span className="text-foreground/70">error:</span>{" "}
                        {message.debug.errorMessage}
                      </div>
                    )}
                    {message.debug.responseSnippet && (
                      <div>
                        <div className="text-foreground/70 mb-1">response snippet:</div>
                        <pre className="bg-background/60 border border-border/50 rounded p-2 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                          {message.debug.responseSnippet}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Image attachments for user messages */}
              {isUser && message.images && message.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {message.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Attachment ${index + 1}`}
                      className="max-w-[140px] max-h-[140px] sm:max-w-[200px] sm:max-h-[200px] rounded-lg object-cover border border-border"
                    />
                  ))}
                </div>
              )}

              {/* Message body */}
              {showTypingIndicator ? (
                <ThinkingIndicator />
              ) : isUser ? (
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">{message.content}</p>
              ) : (
                <div className="group relative">
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-foreground">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-outside ml-4 mb-3 space-y-1.5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-outside ml-4 mb-3 space-y-1.5">{children}</ol>,
                        li: ({ children }) => <li className="text-foreground leading-relaxed">{children}</li>,
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                              {children}
                            </code>
                          ) : (
                            <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto my-3 border border-border/50">
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children }) => <pre className="bg-transparent p-0">{children}</pre>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-3 mt-5 first:mt-0 text-foreground">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-4 text-foreground">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1.5 mt-3 text-foreground">{children}</h3>,
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

                    {/* Image generation skeleton */}
                    {isGeneratingImage && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                          <ImageIcon className="w-3.5 h-3.5 animate-pulse text-primary" />
                          <span>Generating image… ~{elapsed}s</span>
                        </div>
                        <motion.div
                          className="relative w-[300px] h-[300px] rounded-xl overflow-hidden border border-border"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="absolute inset-0 bg-muted" />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                              <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Generated images */}
                    {message.generatedImages && message.generatedImages.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {message.generatedImages.map((img, index) => (
                          <div key={index} className="relative group/image">
                            <a href={img} target="_blank" rel="noopener noreferrer" className="block">
                              <img
                                src={img}
                                alt={`Generated image ${index + 1}`}
                                className="max-w-full sm:max-w-[400px] max-h-[280px] sm:max-h-[400px] rounded-xl object-cover border border-border hover:opacity-90 transition-opacity cursor-pointer w-full"
                              />
                            </a>
                            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover/image:opacity-100 transition-opacity">
                              {onEditImage && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleEditClick(img)}
                                      className="p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background text-foreground shadow-md"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit image</TooltipContent>
                                </Tooltip>
                              )}
                              {onRegenerateImage && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={handleRegenerate}
                                      className="p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background text-foreground shadow-md"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Regenerate image</TooltipContent>
                                </Tooltip>
                              )}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleDownloadImage(img, index)}
                                    className="p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background text-foreground shadow-md"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>Download image</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action buttons - copy */}
                  {message.content && !isStreaming && (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Follow-up Suggestions */}
              {!isUser && !isStreaming && message.suggestions && message.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {message.suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSuggestionClick?.(suggestion)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border/60 bg-background/50 hover:bg-muted hover:border-border text-muted-foreground hover:text-foreground transition-all duration-200"
                    >
                      <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="line-clamp-1">{suggestion}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Dialog */}
      <ImageEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        imageUrl={selectedImageForEdit}
        onSubmit={handleEditSubmit}
        isLoading={isEditingImage}
      />
    </TooltipProvider>
  );
};
