"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollableMessageContainer } from "@/components/chat-helpers/scrollable-message-container";
import { Streamdown } from "streamdown";
import { markdownComponents } from "@/components/chat-helpers/markdown-components";
import { ChevronDown, ChevronRight, Bot, User, AlertCircle } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  reasoning?: string; // New field for reasoning content
  error?: boolean;
};

function useChatHistory(key = "chat-history") {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setMessages(JSON.parse(raw));
    } catch { }
  }, [key]);
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(messages));
    } catch { }
  }, [key, messages]);
  return { messages, setMessages } as const;
}

// Helper to extract reasoning from text (e.g. <think>...</think>)
function parseReasoning(content: string): { reasoning: string | null; cleanText: string } {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
  const match = content.match(thinkRegex);

  if (match) {
    return {
      reasoning: match[1].trim(),
      cleanText: content.replace(thinkRegex, "").trim()
    };
  }
  return { reasoning: null, cleanText: content };
}

async function streamFromGenerate(prompt: string, threadId: string, onDelta: (delta: string) => void) {
  const resp = await fetch("/api/chat", { // Changed to /api/chat to match your backend
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      id: threadId
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(errorText || resp.statusText);
  }

  if (!resp.body) {
    const txt = await resp.text();
    onDelta(txt);
    return;
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder("utf-8");
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    onDelta(decoder.decode(value));
  }
}

const ReasoningAccordion = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!content) return null;

  return (
    <div className="mb-3 rounded-md border border-border/50 bg-muted/30 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span>Thinking Process</span>
      </button>
      {isOpen && (
        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border/50 bg-muted/20 font-mono whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
};

export function SimpleChat({ className, threadId }: { className?: string; threadId?: string | null }) {
  const { messages, setMessages } = useChatHistory(threadId ? `chat-thread-${threadId}` : "chat-history");
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const assistRef = useRef<string>("");

  const canSend = input.trim().length > 0 && !isSending;

  const handleSend = async () => {
    if (!canSend) return;
    const currentThreadId = threadId || crypto.randomUUID();
    const id = crypto.randomUUID();
    const userMsg: ChatMessage = { id, role: "user", text: input };
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "",
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsSending(true);
    assistRef.current = "";

    try {
      await streamFromGenerate(userMsg.text, currentThreadId, (delta) => {
        assistRef.current += delta;

        // Parse reasoning on the fly
        const { reasoning, cleanText } = parseReasoning(assistRef.current);

        setMessages((prev) => {
          const next = [...prev];
          const idx = next.findIndex((m) => m.id === assistantMsg.id);
          if (idx >= 0) {
            next[idx] = {
              ...next[idx],
              text: cleanText || assistRef.current, // Fallback to raw if no clean text yet
              reasoning: reasoning || undefined
            };
          }
          return next;
        });
      });
    } catch (e: any) {
      setMessages((prev) => {
        const next = [...prev];
        const idx = next.findIndex((m) => m.id === assistantMsg.id);
        if (idx >= 0)
          next[idx] = {
            ...next[idx],
            text: `Error: ${e.message || "Something went wrong"}`,
            error: true
          };
        return next;
      });
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const rendered = useMemo(
    () =>
      messages.map((m) => (
        <div key={m.id} className={cn("flex gap-3 mb-6", m.role === "assistant" ? "justify-start" : "justify-end")}>
          {m.role === "assistant" && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
              <Bot className="h-5 w-5 text-primary" />
            </div>
          )}

          <div
            className={cn(
              "relative block px-5 py-3.5 text-[15px] leading-relaxed max-w-[85%] shadow-sm",
              m.role === "assistant"
                ? "bg-card border border-border rounded-2xl rounded-tl-sm text-foreground"
                : "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm",
              m.error && "border-red-500/50 bg-red-500/10 text-red-500"
            )}
          >
            {m.reasoning && <ReasoningAccordion content={m.reasoning} />}

            {m.text ? (
              <div className={cn("prose dark:prose-invert max-w-none", m.role === "user" && "prose-invert")}>
                <Streamdown components={markdownComponents}>{m.text}</Streamdown>
              </div>
            ) : (
              <span className="flex items-center gap-2 text-muted-foreground italic text-sm">
                <span className="animate-pulse">Thinking</span>
                <span className="flex gap-0.5">
                  <span className="animate-bounce delay-0">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </span>
              </span>
            )}
          </div>

          {m.role === "user" && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-1">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      )),
    [messages],
  );

  return (
    <div className={cn("flex h-full w-full flex-col bg-background", className)}>
      <div className="flex-1 min-h-0">
        <ScrollableMessageContainer className="p-4 md:p-6" autoScrollTrigger={messages}>
          <div className="flex flex-col">{rendered}</div>
        </ScrollableMessageContainer>
      </div>
      <div className="flex-shrink-0 p-4 bg-background border-t border-border">
        <div className="relative flex items-end gap-2 max-w-4xl mx-auto w-full">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-3 pr-12 rounded-xl border border-border bg-muted/30 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none min-h-[50px] max-h-[200px]"
            rows={1}
            placeholder="Type a message..."
            style={{ height: 'auto', minHeight: '50px' }}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "absolute right-2 bottom-2 p-2 rounded-lg transition-all duration-200",
              canSend
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-muted-foreground/60">Powered by Z.AI GLM-4.6</span>
        </div>
      </div>
    </div>
  );
}
