import { Pen, Code, Sparkles, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type AIMode = "general" | "writing" | "coding" | "creative" | "research";

interface ModeSelectorProps {
  mode: AIMode;
  onModeChange: (mode: AIMode) => void;
}

const modes = [
  { id: "general" as const, label: "General", icon: Sparkles, description: "All-purpose assistant" },
  { id: "writing" as const, label: "Writing", icon: Pen, description: "Content & copywriting" },
  { id: "coding" as const, label: "Coding", icon: Code, description: "Development help" },
  { id: "research" as const, label: "Research", icon: Search, description: "Deep analysis" },
];

export const ModeSelector = ({ mode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title={m.description}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
