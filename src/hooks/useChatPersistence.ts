import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { Conversation } from "@/components/ConversationSidebar";
import { AIMode } from "@/components/ModeSelector";
import { FileAttachment } from "@/components/ChatInputBox";
import { getCachedResponse, setCachedResponse } from "@/hooks/useResponseCache";

// Wrap toast to prevent duplicate messages
const toast = {
  error: (msg: string) => sonnerToast.error(msg, { id: msg }),
  success: (msg: string) => sonnerToast.success(msg, { id: msg }),
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  images?: string[]; // base64 image data for user uploads
  generatedImages?: string[]; // base64 image data for AI generated images
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

export function useChatPersistence(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [mode, setMode] = useState<AIMode>("general");
  const [isEditingImage, setIsEditingImage] = useState(false);
  // Flag to skip message reload when we just created a conversation inline
  const [skipMessageReload, setSkipMessageReload] = useState(false);

  // Load conversations
  useEffect(() => {
    if (!userId) {
      setIsLoadingConversations(false);
      return;
    }

    const loadConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error loading conversations:", error);
      } else {
        setConversations(data || []);
      }
      setIsLoadingConversations(false);
    };

    loadConversations();
  }, [userId]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!currentConversationId) {
      setMessages([]);
      return;
    }

    // Skip reload if we just created this conversation inline during sendMessage
    if (skipMessageReload) {
      setSkipMessageReload(false);
      return;
    }

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
      } else {
        setMessages(
          data?.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: m.created_at,
          })) || []
        );
      }
    };

    loadMessages();
  }, [currentConversationId, skipMessageReload]);

  const createConversation = useCallback(async () => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
      return null;
    }

    setConversations((prev) => [data, ...prev]);
    setCurrentConversationId(data.id);
    setMessages([]);
    return data.id;
  }, [userId]);

  const updateConversationTitle = useCallback(
    async (conversationId: string, firstMessage: string) => {
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
      
      const { error } = await supabase
        .from("conversations")
        .update({ title })
        .eq("id", conversationId);

      if (!error) {
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
        );
      }
    },
    []
  );

  const deleteConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      toast.error("Failed to delete conversation");
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  }, [currentConversationId]);

  const renameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    const { error } = await supabase
      .from("conversations")
      .update({ title: newTitle })
      .eq("id", conversationId);

    if (error) {
      toast.error("Failed to rename conversation");
      return;
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, title: newTitle } : c))
    );
    toast.success("Conversation renamed");
  }, []);

  const sendMessage = useCallback(
    async (content: string, files?: FileAttachment[]) => {
      if ((!content.trim() && !files?.length) || isLoading || !userId) return;

      // Set loading state immediately for instant UI feedback
      setIsLoading(true);

      let convId = currentConversationId;

      // Create conversation if none exists
      if (!convId) {
        // Set flag before creating so the useEffect won't wipe messages
        setSkipMessageReload(true);
        convId = await createConversation();
        if (!convId) {
          setSkipMessageReload(false);
          setIsLoading(false);
          return;
        }
      }

      // Convert files to base64
      let imageData: string[] = [];
      if (files?.length) {
        try {
          imageData = await Promise.all(
            files.filter((f) => f.type === "image").map((f) => fileToBase64(f.file))
          );
        } catch (error) {
          console.error("Error converting files:", error);
          toast.error("Failed to process images");
        }
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim() || "What's in this image?",
        timestamp: new Date().toISOString(),
        images: imageData.length > 0 ? imageData : undefined,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Update title if first message
      if (messages.length === 0) {
        updateConversationTitle(convId, userMessage.content);
      }

      let assistantContent = "";
      const assistantId = crypto.randomUUID();

      // Check cache for text-only queries without images
      const cached = !imageData.length ? getCachedResponse(userMessage.content) : null;
      if (cached) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: cached.response,
            timestamp: new Date().toISOString(),
            generatedImages: cached.generatedImages,
          },
        ]);

        // Still save to DB
        supabase.from("messages").insert({
          conversation_id: convId!,
          role: "user",
          content: userMessage.content,
        }).then(({ error }) => { if (error) console.error("Error saving user message:", error); });

        await supabase.from("messages").insert({
          conversation_id: convId!,
          role: "assistant",
          content: cached.response,
        });
        await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId!);
        setConversations((prev) =>
          prev.map((c) => c.id === convId ? { ...c, updated_at: new Date().toISOString() } : c)
        );
        setIsLoading(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date().toISOString() },
      ]);

      try {
        // Build messages array for API - limit to recent messages to reduce payload and latency
        const recentMessages = messages.slice(-20);
        const apiMessages = [...recentMessages, userMessage].map((m) => {
          if (m.images?.length) {
            return {
              role: m.role,
              content: [
                { type: "text", text: m.content },
                ...m.images.map((img) => ({
                  type: "image_url",
                  image_url: { url: img },
                })),
              ],
            };
          }
          return { role: m.role, content: m.content };
        });

        // Save user message to DB in parallel (non-blocking for faster response)
        supabase.from("messages").insert({
          conversation_id: convId,
          role: "user",
          content: userMessage.content,
        }).then(({ error }) => {
          if (error) console.error("Error saving user message:", error);
        });

      const fetchWithRetry = async (retries = 1): Promise<Response> => {
        const res = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: apiMessages,
            mode,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          if (retries > 0) {
            console.warn("Chat request failed, retrying...", errorData);
            await new Promise((r) => setTimeout(r, 1000));
            return fetchWithRetry(retries - 1);
          }
          throw new Error(errorData.error || `Request failed with status ${res.status}`);
        }
        return res;
      };

      const response = await fetchWithRetry();

        const contentType = response.headers.get("content-type") || "";

        // Handle image generation response (non-streaming JSON)
        if (contentType.includes("application/json")) {
          const data = await response.json();
          
          if (data.type === "image_generation") {
            const generatedImageUrls = data.images?.map((img: any) => img.image_url?.url).filter(Boolean) || [];
            
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: data.content || "Here's your generated image:", generatedImages: generatedImageUrls }
                  : m
              )
            );
            assistantContent = data.content || "Here's your generated image:";
          } else if (data.error) {
            throw new Error(data.error);
          }
        } else {
          // Handle streaming response (text/event-stream)
          if (!response.body) throw new Error("No response body");

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            let newlineIndex: number;
            while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, newlineIndex);
              buffer = buffer.slice(newlineIndex + 1);

              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (line.startsWith(":") || line.trim() === "") continue;
              if (!line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") break;

              try {
                const parsed = JSON.parse(jsonStr);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  assistantContent += delta;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: assistantContent } : m
                    )
                  );
                }
              } catch {
                buffer = line + "\n" + buffer;
                break;
              }
            }
          }
        }

        // Save assistant message to DB
        if (assistantContent) {
          await supabase.from("messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: assistantContent,
          });

          // Update conversation timestamp
          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", convId);

          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId ? { ...c, updated_at: new Date().toISOString() } : c
            )
          );

          // Cache the response for future identical queries (text-only, no images)
          if (!imageData.length) {
            setCachedResponse(userMessage.content, assistantContent);
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to send message");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, userId, currentConversationId, createConversation, updateConversationTitle, mode]
  );

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const startNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  const regenerateImage = useCallback(
    async (prompt: string) => {
      // Send a new image generation request
      await sendMessage(`Generate an image of ${prompt}`);
    },
    [sendMessage]
  );

  const editImage = useCallback(
    async (imageUrl: string, instruction: string) => {
      if (!userId || isLoading) return;

      // Set loading state immediately for instant UI feedback
      setIsLoading(true);
      setIsEditingImage(true);

      let convId = currentConversationId;
      if (!convId) {
        convId = await createConversation();
        if (!convId) {
          setIsLoading(false);
          setIsEditingImage(false);
          return;
        }
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: `Edit image: ${instruction}`,
        timestamp: new Date().toISOString(),
        images: [imageUrl],
      };

      setMessages((prev) => [...prev, userMessage]);

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date().toISOString() },
      ]);

      try {
        // Save user message to DB in parallel (non-blocking)
        supabase.from("messages").insert({
          conversation_id: convId,
          role: "user",
          content: userMessage.content,
        }).then(({ error }) => {
          if (error) console.error("Error saving edit message:", error);
        });

        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: `Edit this image: ${instruction}` },
                  { type: "image_url", image_url: { url: imageUrl } },
                ],
              },
            ],
            mode: "image_edit",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.type === "image_generation" || data.images) {
          const generatedImageUrls = data.images?.map((img: any) => img.image_url?.url).filter(Boolean) || [];

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: data.content || "Here's your edited image:", generatedImages: generatedImageUrls }
                : m
            )
          );

          // Save to DB
          await supabase.from("messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: data.content || "Here's your edited image:",
          });

          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", convId);
        } else if (data.error) {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error("Image edit error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to edit image");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsEditingImage(false);
        setIsLoading(false);
      }
    },
    [userId, isLoading, currentConversationId, createConversation]
  );

  return {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    isLoadingConversations,
    sendMessage,
    selectConversation,
    startNewConversation,
    deleteConversation,
    renameConversation,
    mode,
    setMode,
    regenerateImage,
    editImage,
    isEditingImage,
  };
}
