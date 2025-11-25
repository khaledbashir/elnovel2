"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SimpleChat } from "@/components/chat/simple-chat";
import { DmsLeftNav } from "@/components/dms/left-nav";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen } from "lucide-react";
import { ThemeToggle } from "@/components/tailwind/ui/theme-toggle";

const MIN_CHAT_WIDTH = 300;
const MAX_CHAT_WIDTH = 600;

export default function SimpleChatPage() {
  const [isNavSidebarCollapsed, setIsNavSidebarCollapsed] = useState(false);
  const [isChatPanelCollapsed, setIsChatPanelCollapsed] = useState(false);
  const [chatWidth, setChatWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved chat width from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('simpleChatWidth');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= MIN_CHAT_WIDTH && width <= MAX_CHAT_WIDTH) {
        setChatWidth(width);
      }
    }
  }, []);

  // Save chat width to localStorage
  useEffect(() => {
    localStorage.setItem('simpleChatWidth', chatWidth.toString());
  }, [chatWidth]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      if (newWidth >= MIN_CHAT_WIDTH && newWidth <= MAX_CHAT_WIDTH) {
        setChatWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col" ref={containerRef}>
      {/* Top Bar with Theme Toggle */}
      <div className="flex-shrink-0 p-2 border-b border-border bg-card flex items-center justify-end">
        <ThemeToggle />
      </div>
      
      <div className="flex flex-1 min-h-0 w-full relative">
        {/* Navigation Sidebar with Toggle */}
        <div className={cn(
          "relative transition-all duration-300 ease-in-out flex-shrink-0",
          isNavSidebarCollapsed ? "w-0 overflow-hidden" : "w-64"
        )}>
          <DmsLeftNav />
        </div>
        
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsNavSidebarCollapsed(!isNavSidebarCollapsed)}
          className={cn(
            "absolute top-2 z-50 p-1.5 rounded-md bg-card border border-border shadow-md hover:bg-accent transition-all duration-300",
            isNavSidebarCollapsed ? "left-2" : "left-[256px]"
          )}
          aria-label={isNavSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isNavSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <div className="flex flex-1 h-full overflow-hidden">
          {/* Left pane: Editor (independent scroll) */}
          <div className="flex-1 h-full overflow-y-auto">
            <TailwindAdvancedEditor documentId={null} workspaceId={null} />
          </div>
          
          {/* Right pane: Chat (fixed, internal scroll) */}
          {!isChatPanelCollapsed && (
            <div 
              className="relative flex h-full border-l border-border bg-card/50 transition-all duration-300"
              style={{ width: chatWidth }}
            >
              <div 
                className="w-1.5 cursor-col-resize absolute top-0 left-0 h-full bg-border hover:bg-primary transition-colors z-10"
                onMouseDown={handleMouseDown}
              />
              <div className="flex flex-col h-full w-full">
                {/* Message list grows and scrolls */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <SimpleChat className="h-full" />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat Panel Toggle Button */}
        <button
          onClick={() => setIsChatPanelCollapsed(!isChatPanelCollapsed)}
          className={cn(
            "absolute top-2 z-50 p-1.5 rounded-md bg-card border border-border shadow-md hover:bg-accent transition-all duration-300",
            isChatPanelCollapsed ? "right-2" : "right-2"
          )}
          aria-label={isChatPanelCollapsed ? "Expand chat panel" : "Collapse chat panel"}
        >
          {isChatPanelCollapsed ? (
            <PanelRightOpen className="h-4 w-4" />
          ) : (
            <PanelRightClose className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}