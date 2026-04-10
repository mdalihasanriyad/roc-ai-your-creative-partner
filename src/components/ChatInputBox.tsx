import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, X, Image, Mic, MicOff, Wand2, Plus } from "lucide-react";
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
  const [aspectRatio, setAspectRatio] = useState<string | null>(
    () => localStorage.getItem("roc-aspect-ratio")
  );

  const saveAspectRatio = (value: string | null) => {
    setAspectRatio(value);
    if (value) localStorage.setItem("roc-aspect-ratio", value);
    else localStorage.removeItem("roc-aspect-ratio");
  };
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [recentStyles, setRecentStyles] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("roc-recent-styles") || "[]");
    } catch {
      return [];
    }
  });
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
    { label: "1:1", value: "1:1" },
    { label: "16:9", value: "16:9" },
    { label: "9:16", value: "9:16" },
  ];

  const isImageMode = input.toLowerCase().startsWith("generate an image of");

  useEffect(() => {
    if (!isImageMode) {
      saveAspectRatio(null);
    }
  }, [isImageMode]);

  const applyStylePreset = (suffix: string) => {
    let base = input;
    IMAGE_STYLE_PRESETS.forEach(p => { base = base.replace(p.suffix, ""); });
    if (customStyleActive && customStyle) {
      base = base.replace(`, ${customStyle}`, "");
    }
    setCustomStyleActive(false);
    setInput(base.trimEnd() + suffix);
    textareaRef.current?.focus();
  };

  const applyCustomStyle = (styleOverride?: string) => {
    const style = (styleOverride ?? customStyle).trim();
    if (!style) return;
    const suffix = `, ${style}`;
    let base = input;
    IMAGE_STYLE_PRESETS.forEach(p => { base = base.replace(p.suffix, ""); });
    if (customStyleActive && customStyle) {
      base = base.replace(`, ${customStyle}`, "");
    }
    setRecentStyles(prev => {
      const updated = [style, ...prev.filter(s => s !== style)].slice(0, 5);
      localStorage.setItem("roc-recent-styles", JSON.stringify(updated));
      return updated;
    });
    if (styleOverride) setCustomStyle(styleOverride);
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

  const removeRecentStyle = (style: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentStyles(prev => {
      const updated = prev.filter(s => s !== style);
      localStorage.setItem("roc-recent-styles", JSON.stringify(updated));
      return updated;
    });
  };

  const handleGenerateImage = () => {
    const prefix = "Generate an image of ";
    setInput(prefix);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(prefix.length, prefix.length);
      }
    });
  };

  useEffect(() => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setInput(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied.');
      } else if (event.error !== 'aborted') {
        toast.error('Voice recognition error.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        try { recognition.start(); } catch { setIsListening(false); }
      }
    };

    recognitionRef.current = recognition;
    return () => { recognition.stop(); };
  }, [isListening]);

  const toggleVoiceInput = () => {
    if (!SpeechRecognition) {
      toast.error('Voice input not supported. Try Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.success('Listening…');
      } catch {
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
      const messageWithRatio =
        isImageMode && aspectRatio
          ? `${input.trimEnd()}, ${aspectRatio} aspect ratio`
          : input;
      onSend(messageWithRatio, attachments.length > 0 ? attachments : undefined);
      setInput("");
      setAttachments([]);
      saveAspectRatio(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }
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
    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 4));
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
    <div className="flex-shrink-0 pb-3 pt-2 px-3 sm:px-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        {/* Image mode options */}
        {isImageMode && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 mb-2"
          >
            <div className="flex gap-1.5 flex-wrap items-center">
              {IMAGE_STYLE_PRESETS.map((preset) => {
                const active = input.includes(preset.suffix);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyStylePreset(active ? "" : preset.suffix)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}

              {customStyleActive ? (
                <button
                  type="button"
                  onClick={removeCustomStyle}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border bg-primary text-primary-foreground border-primary"
                >
                  {customStyle}
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <div className="flex flex-col gap-1">
                  <form
                    onSubmit={(e) => { e.preventDefault(); applyCustomStyle(); }}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="text"
                      value={customStyle}
                      onChange={(e) => setCustomStyle(e.target.value)}
                      placeholder="Custom style…"
                      className="text-xs bg-muted/50 border border-border rounded-lg px-2.5 py-1 w-28 outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground transition-colors"
                    />
                    {customStyle.trim() && (
                      <button
                        type="submit"
                        className="px-2 py-1 rounded-lg text-xs font-medium border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        Apply
                      </button>
                    )}
                  </form>
                  {recentStyles.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Recent:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setRecentStyles([]);
                            localStorage.removeItem("roc-recent-styles");
                          }}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {recentStyles.map((style) => (
                          <div
                            key={style}
                            className="group flex items-center gap-0.5 pl-2 pr-1 py-0.5 rounded-lg text-xs border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
                          >
                            <button type="button" onClick={() => applyCustomStyle(style)} className="leading-none">
                              {style}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => removeRecentStyle(style, e)}
                              className="ml-0.5 rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-1.5 flex-wrap items-center">
              <span className="text-xs text-muted-foreground">Ratio:</span>
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  type="button"
                  onClick={() => saveAspectRatio(aspectRatio === ratio.value ? null : ratio.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    aspectRatio === ratio.value
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "bg-muted/50 text-muted-foreground border-border hover:border-secondary/50 hover:text-foreground"
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main input container - ChatGPT style */}
        <div className="relative rounded-2xl border border-border bg-card shadow-sm focus-within:border-border focus-within:ring-1 focus-within:ring-ring/20 transition-all">
          {/* File Previews */}
          {attachments.length > 0 && (
            <div className="flex gap-2 px-3 pt-3 flex-wrap">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="relative group w-14 h-14 rounded-lg overflow-hidden border border-border"
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

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Listening… speak now"
                : "Message Roc AI…"
            }
            rows={1}
            className={`w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm sm:text-base py-3 px-4 resize-none min-h-[48px] max-h-[200px] ${
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

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-2.5">
            <div className="flex items-center gap-0.5">
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
                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleGenerateImage}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate image</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleVoiceInput}
                    className={`h-8 w-8 rounded-lg transition-colors ${
                      isListening
                        ? "text-destructive animate-pulse"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isListening ? "Stop listening" : "Voice input"}
                </TooltipContent>
              </Tooltip>
            </div>

            <Button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className="h-8 w-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30 transition-all"
              size="icon"
            >
              <Send className={`h-4 w-4 ${isLoading ? "animate-pulse" : ""}`} />
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">
          Roc AI may make mistakes. Please verify important information.
        </p>
      </form>
    </div>
  );
};
