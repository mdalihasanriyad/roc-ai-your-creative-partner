import { motion } from "framer-motion";
import { Send, Paperclip, Mic } from "lucide-react";
import { useState } from "react";

export const ChatInput = () => {
  const [message, setMessage] = useState("");

  const placeholders = [
    "Write a blog post about...",
    "Help me debug this code...",
    "Create an image prompt for...",
    "Research the latest on...",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative"
      >
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-20 blur-lg" />
        
        {/* Input Container */}
        <div className="relative glass-card rounded-2xl p-2">
          <div className="flex items-center gap-2">
            <button className="p-3 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/50">
              <Paperclip className="h-5 w-5" />
            </button>
            
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholders[0]}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base py-3"
            />
            
            <button className="p-3 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/50">
              <Mic className="h-5 w-5" />
            </button>
            
            <button className="p-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Suggestions */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        {["✍️ Writing", "💻 Code", "🎨 Creative", "🔍 Research"].map((tag) => (
          <motion.button
            key={tag}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-full text-sm text-muted-foreground glass-card hover:text-foreground transition-colors"
          >
            {tag}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
