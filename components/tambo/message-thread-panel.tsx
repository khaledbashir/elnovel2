"use client";

import {
  MessageInput,
  MessageInputTextarea,
  MessageInputToolbar,
  MessageInputSubmitButton,
  MessageInputError,
  MessageInputFileButton,
  MessageInputMcpPromptButton,
} from "@/components/tambo/message-input";
import {
  MessageSuggestions,
  MessageSuggestionsStatus,
  MessageSuggestionsList,
} from "@/components/tambo/message-suggestions";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import type { messageVariants } from "@/components/tambo/message";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { AgentSelector } from "@/components/agents/agent-selector";
import { AgentBuilder } from "@/components/agents/agent-builder";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import type { Suggestion } from "@tambo-ai/react";
import { useChat } from "ai/react"; // Vercel AI SDK
import { v4 as uuidv4 } from 'uuid';

export interface MessageThreadPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  contextKey?: string;
  variant?: VariantProps<typeof messageVariants>["variant"];
}

export const MessageThreadPanel = React.forwardRef<
  HTMLDivElement,
  MessageThreadPanelProps
>((({ className, contextKey, variant, ...props }, ref) => {
  const [threadId, setThreadId] = React.useState(uuidv4());
  const [showAgentBuilder, setShowAgentBuilder] = React.useState(false);
  const [selectedAgentSystem, setSelectedAgentSystem] = React.useState<string>("");

  // Vercel AI SDK Hook
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    body: {
      id: threadId,
      system: selectedAgentSystem, // Pass selected agent instructions
    },
    onError: (error) => {
      console.error("Chat error:", error);
    }
  });

  const defaultSuggestions: Suggestion[] = [
    {
      id: "suggestion-1",
      title: "Get started",
      detailedSuggestion: "What can you help me with?",
      messageId: "welcome-query",
    },
    {
      id: "suggestion-2",
      title: "Learn more",
      detailedSuggestion: "Tell me about your capabilities.",
      messageId: "capabilities-query",
    },
    {
      id: "suggestion-3",
      title: "Examples",
      detailedSuggestion: "Show me some example queries I can try.",
      messageId: "examples-query",
    },
  ];

  // Helper to handle suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange({ target: { value: suggestion } } as any);
    // Optional: Auto-submit
  };

  return (
    <>
      <div
        ref={ref}
        className={cn("flex flex-col h-full bg-card", className)}
        {...props}
      >
        {/* Agent Selector */}
        <AgentSelector
          onManageAgents={() => setShowAgentBuilder(true)}
        />

        {/* Messages Area */}
        <ScrollableMessageContainer className="flex-1 min-h-0 p-4">
          <div className="flex flex-col space-y-6 max-w-3xl mx-auto w-full">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-4", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium border",
                  m.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border"
                )}>
                  {m.role === "user" ? "U" : "AI"}
                </div>

                {/* Message Bubble */}
                <div className={cn(
                  "flex flex-col gap-1 min-w-0 max-w-[85%]",
                  m.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-wrap leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-card-foreground rounded-tl-sm"
                  )}>
                    {m.content}
                  </div>
                  {/* Timestamp or Status (Optional) */}
                  {/* <span className="text-[10px] text-muted-foreground opacity-50">Just now</span> */}
                </div>
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 text-xs">AI</div>
                <div className="flex flex-col gap-1 items-start">
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollableMessageContainer>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="px-4 pb-4 max-w-3xl mx-auto w-full">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {defaultSuggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(s.detailedSuggestion)}
                  className="flex flex-col items-start p-3 space-y-1 text-left border rounded-xl hover:bg-accent/50 transition-all duration-200 group"
                >
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{s.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">{s.detailedSuggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="relative flex flex-col w-full overflow-hidden rounded-xl border bg-card shadow-sm focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="min-h-[60px] w-full resize-none border-0 bg-transparent p-4 pr-20 focus:ring-0 sm:text-sm focus:outline-none placeholder:text-muted-foreground/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                {/* Placeholder for File Upload Button */}
                <button type="button" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-muted-foreground/60">AI can make mistakes. Check important info.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Builder Dialog */}
      <AgentBuilder
        open={showAgentBuilder}
        onOpenChange={setShowAgentBuilder}
      />
    </>
  );
}));
MessageThreadPanel.displayName = "MessageThreadPanel";

