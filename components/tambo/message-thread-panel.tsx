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
        // We need to update AgentSelector to pass system instructions back up
        // For now, we assume it sets internal state, but we'll need to wire this up
        />

        {/* Messages Area */}
        <ScrollableMessageContainer className="flex-1 min-h-0 p-4">
          <div className="flex flex-col space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-muted max-w-[80%] rounded-lg p-3 text-sm animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollableMessageContainer>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="px-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {defaultSuggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(s.detailedSuggestion)}
                  className="flex flex-col items-start p-3 space-y-1 text-left border rounded-lg hover:bg-accent transition-colors"
                >
                  <span className="text-sm font-medium">{s.title}</span>
                  <span className="text-xs text-muted-foreground">{s.detailedSuggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-background/50">
          <form onSubmit={handleSubmit} className="relative flex flex-col w-full overflow-hidden rounded-lg border bg-background shadow-sm">
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="min-h-[60px] w-full resize-none border-0 bg-transparent p-4 pr-20 focus:ring-0 sm:text-sm focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <div className="absolute bottom-2 right-2 flex items-center">
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
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

