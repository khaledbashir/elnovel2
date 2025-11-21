"use client";

import {
  MessageInput,
  MessageInputTextarea,
  MessageInputToolbar,
  MessageInputSubmitButton,
  MessageInputError,
  MessageInputFileButton,
  MessageInputMcpPromptButton,
  // MessageInputMcpConfigButton,
} from "@/components/tambo/message-input";
import {
  MessageSuggestions,
  MessageSuggestionsStatus,
  MessageSuggestionsList,
} from "@/components/tambo/message-suggestions";
import {
  ThreadHistory,
  ThreadHistoryHeader,
  ThreadHistoryNewButton,
  ThreadHistorySearch,
  ThreadHistoryList,
} from "@/components/tambo/thread-history";
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
import type { messageVariants } from "@/components/tambo/message";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { cn } from "@/lib/utils";
import {
  useMergedRef,
  useCanvasDetection,
  usePositioning,
} from "@/lib/thread-hooks";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { useRef } from "react";
import type { Suggestion } from "@tambo-ai/react";

/**
 * Props for the MessageThreadPanel component
 * @interface
 */
export interface MessageThreadPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional key to identify the context of the thread
   * Used to maintain separate thread histories for different contexts
   */
  contextKey?: string;
  /** Optional content to render in the left panel of the grid */
  children?: React.ReactNode;
  /**
   * Controls the visual styling of messages in the thread.
   * Possible values include: "default", "compact", etc.
   * These values are defined in messageVariants from "@/components/tambo/message".
   * @example variant="compact"
   */
  variant?: VariantProps<typeof messageVariants>["variant"];
}

/**
 * Props for the ResizablePanel component
 */
interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isLeftPanel: boolean;
  isOpen?: boolean;
}

/**
 * A resizable panel component with a draggable divider
 */
const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({ className, children, isLeftPanel, isOpen = true, ...props }, ref) => {
    const [width, setWidth] = React.useState(400);
    const isResizing = React.useRef(false);
    const lastUpdateRef = React.useRef(0);
    const pointerIdRef = React.useRef<number | null>(null);

    const updateWidth = React.useCallback(
      (clientX: number) => {
        const now = Date.now();
        if (now - lastUpdateRef.current < 16) return;
        lastUpdateRef.current = now;

        const viewportWidth = window.innerWidth;

        requestAnimationFrame(() => {
          let newWidth = 400;
          if (isLeftPanel) {
            newWidth = Math.round(clientX);
          } else {
            newWidth = Math.round(viewportWidth - clientX);
          }

          const minWidth = 300;
          const maxWidth = Math.max(minWidth, viewportWidth - 300);
          newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
          setWidth(newWidth);
        });
      },
      [isLeftPanel],
    );

    const handlePointerMove = React.useCallback(
      (e: PointerEvent) => {
        if (!isResizing.current) return;
        updateWidth(e.clientX);
      },
      [updateWidth],
    );

    const stopResizing = React.useCallback(() => {
      isResizing.current = false;
      pointerIdRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", stopResizing);
    }, [handlePointerMove]);

    const handlePointerDown = (e: React.PointerEvent) => {
      e.preventDefault();
      isResizing.current = true;
      pointerIdRef.current = e.pointerId;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", stopResizing);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = 24;
      const viewportWidth = window.innerWidth;
      const minWidth = 300;
      const maxWidth = Math.max(minWidth, viewportWidth - 300);
      if (e.key === "ArrowLeft") {
        setWidth((w) => Math.max(minWidth, Math.min(maxWidth, isLeftPanel ? w - step : w + step)));
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        setWidth((w) => Math.max(minWidth, Math.min(maxWidth, isLeftPanel ? w + step : w - step)));
        e.preventDefault();
      }
    };

    return (
      <div
        ref={ref}
        className={cn("relative flex", className)}
        style={{ width: isOpen ? `${width}px` : "0px" }}
        {...props}
      >
        {isOpen && children}
        {isOpen && (
          <div
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onKeyDown={handleKeyDown}
            className="absolute top-0 bottom-0 w-1 cursor-col-resize transition-colors z-10 resizable-handle"
            style={{
              right: isLeftPanel ? "-2px" : "auto",
              left: !isLeftPanel ? "-2px" : "auto",
              touchAction: "none",
            }}
          />
        )}
      </div>
    );
  },
);
ResizablePanel.displayName = "ResizablePanel";

/**
 * A panel-based message thread component with resizable panels
 * Perfect for dashboard layouts where you want a chat panel alongside main content
 *
 * @component MessageThreadPanel
 * @example
 * ```tsx
 * <MessageThreadPanel
 *   contextKey="dashboard-assistant"
 *   className="right"
 *   style={{ width: "400px" }}
 * />
 * ```
 */
export const MessageThreadPanel = React.forwardRef<
  HTMLDivElement,
  MessageThreadPanelProps
>(
  (
    { className, contextKey, children, variant, style, ...props },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { hasCanvasSpace, canvasIsOnLeft } = useCanvasDetection(containerRef);
    const { isLeftPanel, historyPosition } = usePositioning(
      className,
      canvasIsOnLeft,
      hasCanvasSpace,
    );
    const mergedRef = useMergedRef<HTMLDivElement | null>(ref, containerRef);
    const [isOpen, setIsOpen] = React.useState(true);

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

    const threadHistorySidebar = (
      <ThreadHistory contextKey={contextKey} position={historyPosition}>
        <ThreadHistoryHeader />
        <ThreadHistoryNewButton />
        <ThreadHistorySearch />
        <ThreadHistoryList />
      </ThreadHistory>
    );

    return (
      <div
        ref={mergedRef}
        className={cn(
          "flex h-full bg-background border-l border-border/50 shadow-lg",
          hasCanvasSpace && "border-l border-border",
          className,
        )}
        style={style}
        {...props}
      >
        {/* Left panel - main content or empty */}
        {children && (
          <ResizablePanel isLeftPanel={true} isOpen={true}>
            {children}
          </ResizablePanel>
        )}

        {/* Thread History Sidebar - rendered first if history is on the left */}
        {historyPosition === "left" && threadHistorySidebar}

        <ResizablePanel isLeftPanel={false} isOpen={isOpen} className="bg-card/50">
          <div className="flex h-full flex-col min-w-0">
            <div className="flex items-center justify-between px-2 py-2 border-b">
              <button
                className="inline-flex items-center rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen((v) => !v)}
                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <span className="inline-flex items-center gap-1">
                  {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="M9 18l6-6-6-6"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="M15 18l-6-6 6-6"/></svg>
                  )}
                  {isOpen ? "Collapse" : "Expand"}
                </span>
              </button>
            </div>
            <ScrollableMessageContainer className="min-h-0 p-4 bg-background/50">
              <ThreadContent variant={variant}>
                <ThreadContentMessages />
              </ThreadContent>
            </ScrollableMessageContainer>
            <MessageSuggestions>
              <MessageSuggestionsStatus />
            </MessageSuggestions>
            <div className="flex-shrink-0 p-4 bg-background/80 border-t border-border/50">
              <MessageInput contextKey={contextKey}>
                <MessageInputTextarea className="w-full sm:w-[80%] sm:min-w-[600px] p-4" placeholder="Type your message or paste images..." />
                <MessageInputToolbar>
                  <MessageInputFileButton />
                  <MessageInputMcpPromptButton />
                  <MessageInputSubmitButton />
                </MessageInputToolbar>
                <MessageInputError />
              </MessageInput>
            </div>
            <MessageSuggestions initialSuggestions={defaultSuggestions}>
              <MessageSuggestionsList />
            </MessageSuggestions>
          </div>
        </ResizablePanel>

        {/* Thread History Sidebar - rendered last if history is on the right */}
        {historyPosition === "right" && threadHistorySidebar}
      </div>
    );
  },
);
MessageThreadPanel.displayName = "MessageThreadPanel";

