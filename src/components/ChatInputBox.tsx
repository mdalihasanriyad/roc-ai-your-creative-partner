import { useState, FormEvent, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

interface ChatInputBoxProps {
  onSend: (message: string) => void;
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
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

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Roc anything..."
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
                disabled={!input.trim() || isLoading}
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
