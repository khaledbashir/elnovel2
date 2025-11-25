"use client";

/**
 * Simple Tambo Chat Component
 * Uses official Tambo hooks exactly as documented
 * Only customizations: colors (via CSS) and PricingTable component registration
 */

import {
  useTambo,
  useTamboThread,
  useTamboThreadInput,
  useTamboThreadList,
  type TamboThreadMessage,
} from "@tambo-ai/react";
import { Button } from "@/components/tailwind/ui/button";
import { ScrollArea } from "@/components/tailwind/ui/scroll-area";
import { Loader2 } from "lucide-react";
import * as React from "react";

interface SimpleTamboChatProps {
  className?: string;
}

export function SimpleTamboChat({ className }: SimpleTamboChatProps) {
  const { thread, isIdle } = useTambo();
  const { switchCurrentThread } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const { data: threadList } = useTamboThreadList();

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!value.trim() || isPending) return;

    await submit({ streamResponse: true });
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const messages =
    thread?.messages?.filter(
      (m) => m.role !== "system" && !m.parentMessageId
    ) ?? [];

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [value]);

  return (
    <div
      className={`flex flex-col h-full bg-background border-l border-border ${className || ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <h2 className="text-sm font-medium text-foreground">
          {thread?.name || "Chat"}
        </h2>
        {threadList && Array.isArray(threadList) && threadList.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                switchCurrentThread(e.target.value);
              } else {
                switchCurrentThread(undefined as any);
              }
            }}
            value={thread?.id || ""}
            className="text-xs bg-background border border-border rounded px-2 py-1"
          >
            <option value="">New Chat</option>
            {threadList.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name || "Untitled"}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
              <p className="text-sm text-muted-foreground">
                Start a conversation
              </p>
            </div>
          ) : (
            messages.map((message: TamboThreadMessage, index: number) => {
              const isUser = message.role === "user";
              const isLast = index === messages.length - 1;
              const isLoading = !isIdle && isLast && !isUser;

              return (
                <div
                  key={message.id ?? `msg-${index}`}
                  className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex flex-col ${isUser ? "max-w-3xl" : "w-full"
                      }`}
                  >
                    <div
                      className={`rounded-3xl px-4 py-2 text-[15px] leading-relaxed transition-all duration-200 font-medium ${isUser
                        ? "bg-foreground text-background"
                        : "text-foreground"
                        }`}
                    >
                      {Array.isArray(message.content) ? (
                        message.content
                          .filter((part) => part.type === "text")
                          .map((part, i) => (
                            <div
                              key={i}
                              className="break-words whitespace-pre-wrap"
                            >
                              {part.text}
                            </div>
                          ))
                      ) : (
                        <div className="break-words whitespace-pre-wrap">
                          {String(message.content)}
                        </div>
                      )}

                      {isLoading && (
                        <div className="flex items-center gap-2 justify-start h-4 py-1 mt-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Streaming...</span>
                        </div>
                      )}
                    </div>

                    {/* Rendered component (e.g., PricingTable) */}
                    {message.renderedComponent && (
                      <div className="mt-2 w-full">
                        {message.renderedComponent}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4 flex-shrink-0 bg-background">
        <form onSubmit={handleSend} className="w-full">
          <div className="flex items-end gap-2 bg-background rounded-lg border border-border shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 transition-all">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-h-[44px] max-h-[200px] px-4 py-3 text-sm bg-transparent border-0 rounded-lg resize-none focus:outline-none disabled:opacity-50 placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isPending}
              rows={1}
            />
            <Button
              type="submit"
              disabled={!value.trim() || isPending}
              size="icon"
              className="h-[44px] w-[44px] m-1 flex-shrink-0 rounded-lg"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6L8 2L14 6M8 14V2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

