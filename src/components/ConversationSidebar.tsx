import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Trash2, X, LogOut, Search, Pencil, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onClose?: () => void;
  onSignOut: () => void;
  isOpen: boolean;
}

export const ConversationSidebar = ({
  conversations,
  currentId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onClose,
  onSignOut,
  isOpen,
}: ConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (conv) => conv.title?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title || "New conversation");
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") saveEdit(id);
    else if (e.key === "Escape") setEditingId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "fixed inset-y-0 left-0 md:relative z-[70] md:z-auto",
          "w-[280px] h-full bg-sidebar-background border-r border-sidebar-border",
          "flex flex-col",
          !isOpen && "md:hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 h-[53px] border-b border-sidebar-border">
          <h2 className="font-display font-semibold text-sm text-sidebar-foreground">History</h2>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" onClick={onNew} title="New chat" className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground">
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-sidebar-accent/50 border-sidebar-border focus:border-sidebar-ring"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <div className="px-2 py-1 space-y-0.5">
            {filteredConversations.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                {searchQuery ? "No results" : "No conversations yet"}
              </p>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                    currentId === conv.id
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                  onClick={() => editingId !== conv.id && onSelect(conv.id)}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-60" />
                  <div className="flex-1 min-w-0">
                    {editingId === conv.id ? (
                      <Input
                        ref={editInputRef}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, conv.id)}
                        onBlur={() => saveEdit(conv.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-6 text-xs py-0 px-1.5"
                      />
                    ) : (
                      <p className="text-sm truncate">{conv.title || "New conversation"}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {editingId === conv.id ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEdit(conv.id);
                        }}
                      >
                        <Check className="h-3 w-3 text-primary" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        onClick={(e) => startEditing(conv, e)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conv.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-xs text-sidebar-foreground/60 hover:text-destructive h-8"
            onClick={onSignOut}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </motion.aside>
    </>
  );
};
