import { useState, FormEvent, KeyboardEvent, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Trash2, X, Image } from "lucide-react";
import { Button } from "./ui/button";

export type FileAttachment = {
  file: File;
  preview: string;
  type: "image" | "document";
};

interface ChatInputBoxProps {
  onSend: (message: string, files?: FileAttachment[]) => void;
  onClear: () => void;
  isLoading: boolean;
  hasMessages: boolean;
}

export const ChatInputBox = ({
  onSend,
  onClear,
  isLoading,
  hasMessages,
}: ChatInputBoxProps) => {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSend(input, attachments.length > 0 ? attachments : undefined);
      setInput("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        newAttachments.push({ file, preview, type: "image" });
      }
    });

    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 4)); // Max 4 files
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const newAttachments = [...prev];
      URL.revokeObjectURL(newAttachments[index].preview);
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  return (
    <div className="p-4 border-t border-border">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <motion.div
          whileFocus={{ scale: 1.01 }}
          className="relative"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-10 blur-lg" />

          {/* Input Container */}
          <div className="relative glass-card rounded-2xl p-2">
            {/* File Previews */}
            {attachments.length > 0 && (
              <div className="flex gap-2 p-2 pb-0 flex-wrap">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border"
                  >
                    <img
                      src={attachment.preview}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              {hasMessages && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                  title="Clear chat"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}

              {/* File Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 text-muted-foreground hover:text-primary"
                title="Attach image"
              >
                <Image className="h-5 w-5" />
              </Button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={attachments.length > 0 ? "Add a message or send..." : "Ask Roc anything..."}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base py-3 px-2 resize-none min-h-[48px] max-h-[200px]"
                style={{
                  height: "auto",
                  overflow: input.split("\n").length > 5 ? "auto" : "hidden",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 200) + "px";
                }}
              />

              <Button
                type="submit"
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className="flex-shrink-0 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                size="icon"
              >
                <Send className={`h-5 w-5 ${isLoading ? "animate-pulse" : ""}`} />
              </Button>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Roc AI may make mistakes. Please verify important information.
        </p>
      </form>
    </div>
  );
};
