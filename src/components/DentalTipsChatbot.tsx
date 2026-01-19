import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, MessageCircle, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import toothyLogo from "@/assets/toothyquest-logo.jpeg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DentalTipsChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  childName?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dental-tips-chat`;

const suggestedQuestions = [
  "Why do I need to brush my teeth?",
  "What are sugar bugs?",
  "How long should I brush?",
  "Is the dentist scary?",
  "What foods are good for teeth?",
];

export const DentalTipsChatbot = ({ isOpen, onClose, childName }: DentalTipsChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hi ${childName || "there"}! I'm Toothy, your friendly tooth buddy! 🦷 Ask me anything about keeping your teeth super sparkly and healthy! What would you like to know?`
      }]);
    }
  }, [isOpen, childName, messages.length]);

  // Reset chat when closed
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInput("");
    }
  }, [isOpen]);

  const streamChat = useCallback(async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    setInput("");

    let assistantContent = "";

    try {
      // Get the current session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to chat with Toothy!");
        setIsLoading(false);
        return;
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: newMessages, childName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // Add empty assistant message to stream into
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, put back and wait
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
            }
          } catch { /* ignore */ }
        }
        if (assistantContent) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantContent };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Oops! Toothy had a hiccup. Try again!");
      // Remove the loading assistant message
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, childName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
  };

  const handleSuggestion = (question: string) => {
    if (isLoading) return;
    streamChat(question);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[600px] flex flex-col bg-gradient-to-b from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800 p-0">
        <DialogHeader className="p-4 pb-2 border-b border-blue-200 dark:border-blue-800">
          <DialogTitle className="flex items-center gap-3 text-xl font-display">
            <img 
              src={toothyLogo} 
              alt="Toothy" 
              className="w-10 h-10 rounded-full border-2 border-primary shadow-sm"
            />
            <span>Ask Toothy! 🦷</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-white dark:bg-slate-800 shadow-sm border border-blue-100 dark:border-blue-900"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span>Toothy</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-blue-100 dark:border-blue-900">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Toothy is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 space-y-2"
            >
              <p className="text-xs text-muted-foreground text-center">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(question)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 pt-2 border-t border-blue-200 dark:border-blue-800">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Toothy a question..."
              disabled={isLoading}
              className="flex-1 rounded-full bg-white dark:bg-slate-800"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-full bg-primary hover:bg-primary/90 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DentalTipsChatbot;
