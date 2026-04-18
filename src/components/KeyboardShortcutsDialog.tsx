import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Keyboard } from "lucide-react";

const shortcuts = [
  { keys: ["Enter"], description: "Send message" },
  { keys: ["Shift", "Enter"], description: "New line" },
  { keys: ["Esc"], description: "Clear current input" },
  { keys: ["Ctrl", "Shift", "N"], description: "New conversation" },
  { keys: ["Ctrl", "Shift", "S"], description: "Toggle sidebar" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
];

const Kbd = ({ children }: { children: string }) => (
  <kbd className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1.5 rounded-md border border-border bg-muted text-xs font-mono font-medium text-muted-foreground shadow-sm">
    {children}
  </kbd>
);

export const KeyboardShortcutsDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "?" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-display">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1 pt-2">
          {shortcuts.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 px-1 rounded-md"
            >
              <span className="text-sm text-foreground">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <span key={j} className="flex items-center gap-1">
                    {j > 0 && <span className="text-xs text-muted-foreground">+</span>}
                    <Kbd>{key}</Kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground pt-2 text-center">
          Press <Kbd>?</Kbd> to toggle this dialog
        </p>
      </DialogContent>
    </Dialog>
  );
};
