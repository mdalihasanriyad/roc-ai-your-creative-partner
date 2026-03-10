import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Trash2, X, Image, Mic, MicOff, Wand2 } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";

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

// Check for Web Speech API support
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const ChatInputBox = ({
  onSend,
  onClear,
  isLoading,
  hasMessages,
}: ChatInputBoxProps) => {
  const [input, setInput] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [customStyleActive, setCustomStyleActive] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const IMAGE_STYLE_PRESETS = [
    { label: "Photorealistic", suffix: ", photorealistic, ultra-detailed" },
    { label: "Anime", suffix: ", anime style, vibrant" },
    { label: "Watercolor", suffix: ", watercolor painting, soft strokes" },
    { label: "Oil Painting", suffix: ", oil painting, textured canvas" },
  ];

  const ASPECT_RATIOS = [
    { label: "Square 1:1", value: "1:1" },
    { label: "Landscape 16:9", value: "16:9" },
    { label: "Portrait 9:16", value: "9:16" },
  ];

  const isImageMode = input.toLowerCase().startsWith("generate an image of");

  const applyStylePreset = (suffix: string) => {
    let base = input;
    // Remove all known preset suffixes
    IMAGE_STYLE_PRESETS.forEach(p => { base = base.replace(p.suffix, ""); });
    // Remove active custom style if any
    if (customStyleActive && customStyle) {
      base = base.replace(`, ${customStyle}`, "");
    }
    setCustomStyleActive(false);
    setInput(base.trimEnd() + suffix);
    textareaRef.current?.focus();
  };

  const applyCustomStyle = () => {
    if (!customStyle.trim()) return;
    const suffix = `, ${customStyle.trim()}`;
    let base = input;
    IMAGE_STYLE_PRESETS.forEach(p => { base = base.replace(p.suffix, ""); });
    // Remove previous custom style
    if (customStyleActive && customStyle) {
      base = base.replace(`, ${customStyle}`, "");
    }
    setCustomStyleActive(true);
    setInput(base.trimEnd() + suffix);
    textareaRef.current?.focus();
  };

  const removeCustomStyle = () => {
    if (customStyleActive && customStyle) {
      setInput(prev => prev.replace(`, ${customStyle}`, ""));
    }
    setCustomStyleActive(false);
    setCustomStyle("");
  };

  const handleGenerateImage = () => {
    const prefix = "Generate an image of ";
    setInput(prefix);
    // Focus the textarea and place cursor at the end
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(prefix.length, prefix.length);
      }
    }, 0);
    toast.info("Describe the image you want to create");
  };

  // Initialize speech recognition
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInput(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable it in your browser settings.');
      } else if (event.error !== 'aborted') {
        toast.error('Voice recognition error. Please try again.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart if still supposed to be listening
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [isListening]);

  const toggleVoiceInput = () => {
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.success('Listening... Speak now');
      } catch (e) {
        toast.error('Could not start voice recognition');
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSend(input, attachments.length > 0 ? attachments : undefined);
      setInput("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to send
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }
    // Enter without shift to send
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }
    // Escape to clear input
    if (e.key === "Escape") {
      e.preventDefault();
      setInput("");
      setAttachments([]);
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }
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
      {/* Style Presets */}
          {isImageMode && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 flex-wrap items-center mb-2"
            >
              {IMAGE_STYLE_PRESETS.map((preset) => {
                const active = input.includes(preset.suffix);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyStylePreset(active ? "" : preset.suffix)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border hover:border-primary hover:text-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}

              {/* Custom style chip + input */}
              {customStyleActive ? (
                <button
                  type="button"
                  onClick={removeCustomStyle}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-primary text-primary-foreground border-primary transition-all duration-200"
                >
                  {customStyle}
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); applyCustomStyle(); }}
                  className="flex items-center gap-1"
                >
                  <input
                    type="text"
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    placeholder="Custom style…"
                    className="text-xs bg-muted/50 border border-border rounded-full px-3 py-1 w-28 outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors"
                  />
                  {customStyle.trim() && (
                    <button
                      type="submit"
                      className="px-2 py-1 rounded-full text-xs font-medium border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      Apply
                    </button>
                  )}
                </form>
              )}
            </motion.div>
          )}

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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={onClear}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear chat</TooltipContent>
                </Tooltip>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 text-muted-foreground hover:text-primary"
                  >
                    <Image className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach image</TooltipContent>
              </Tooltip>

              {/* Voice Input Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleVoiceInput}
                    className={`flex-shrink-0 transition-colors ${
                      isListening 
                        ? "text-destructive animate-pulse" 
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isListening ? "Stop listening" : "Voice input"}
                </TooltipContent>
              </Tooltip>

              {/* Generate Image Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleGenerateImage}
                    className="flex-shrink-0 text-muted-foreground hover:text-primary"
                  >
                    <Wand2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Generate image with AI
                </TooltipContent>
              </Tooltip>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening 
                    ? "Listening... speak now" 
                    : attachments.length > 0 
                      ? "Add a message or send..." 
                      : "Ask Roc anything..."
                }
                rows={1}
                className={`flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base py-3 px-2 resize-none min-h-[48px] max-h-[200px] ${
                  isListening ? "placeholder:animate-pulse" : ""
                }`}
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
