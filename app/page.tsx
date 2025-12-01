"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopActionBar } from "@/components/top-action-bar";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, PanelRightClose, PanelRight } from "lucide-react";
import "@copilotkit/react-ui/styles.css";
import { SessionGoalModal } from "@/components/session-goal-modal";
import { CopilotPanel } from "@/components/copilot-panel";

export default function Page() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCopilotCollapsed, setIsCopilotCollapsed] = useState(false);
  const [copilotWidth, setCopilotWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 280 && newWidth < 800) {
        setCopilotWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, copilotWidth]);

  // Session Goal State
  const [sessionGoal, setSessionGoal] = useState<string | null>(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);

    // ... existing state

    // ... existing useEffects

    return (
      <div className={cn("fixed inset-0 flex", isResizing && "cursor-col-resize select-none")} ref={containerRef}>
        <SessionGoalModal
          isOpen={!isSessionStarted}
          onStartSession={(goal) => {
            setSessionGoal(goal);
            setIsSessionStarted(true);
            // TODO: Save goal to DB or Context
            console.log("Session Goal Set:", goal);
          }}
        />

        {/* Navigation Sidebar with Toggle */}
        <div className={cn(
          "relative flex-shrink-0 h-full bg-card border-r border-border transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
        )}>
          <Sidebar
            selectedDocument={selectedDocument}
            selectedWorkspace={selectedWorkspace}
            onDocumentSelect={setSelectedDocument}
            onWorkspaceSelect={setSelectedWorkspace}
          />
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={cn(
            "absolute top-4 z-50 p-2 rounded-md bg-card border border-border shadow-md",
            "hover:bg-accent transition-all duration-300 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "transform transition-transform duration-300",
            isSidebarCollapsed ? "left-2" : "left-[320px]"
          )}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isSidebarCollapsed}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 transition-transform duration-300" />
          ) : (
            <ChevronLeft className="h-4 w-4 transition-transform duration-300" />
          )}
        </button>

        {/* Copilot Sidebar Toggle Button */}
        <button
          onClick={() => setIsCopilotCollapsed(!isCopilotCollapsed)}
          className={cn(
            "absolute top-4 z-50 p-2 rounded-md bg-card border border-border shadow-md",
            "hover:bg-accent transition-all duration-300 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "transform transition-transform duration-300",
            "right-4"
          )}
          aria-label={isCopilotCollapsed ? "Show AI Assistant" : "Hide AI Assistant"}
          aria-expanded={!isCopilotCollapsed}
          title={isCopilotCollapsed ? "Show AI Assistant" : "Hide AI Assistant"}
        >
          {isCopilotCollapsed ? (
            <PanelRight className="h-4 w-4 transition-transform duration-300" />
          ) : (
            <PanelRightClose className="h-4 w-4 transition-transform duration-300" />
          )}
        </button>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <TopActionBar
            workspaceId={selectedWorkspace}
            documentId={selectedDocument}
          />
          <div className="flex-1 flex overflow-hidden relative">
            {/* Editor - takes remaining space */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <TailwindAdvancedEditor
                documentId={selectedDocument}
                workspaceId={selectedWorkspace}
              />
            </div>

            {/* Copilot Panel with Resize Handle */}
            {!isCopilotCollapsed && (
              <div 
                className="flex h-full flex-shrink-0"
                style={{ width: copilotWidth }}
              >
                {/* Resize Handle */}
                <div
                  className={cn(
                    "w-1 h-full cursor-col-resize bg-border hover:bg-primary/50 active:bg-primary transition-colors flex-shrink-0",
                    "flex items-center justify-center group",
                    isResizing && "bg-primary"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsResizing(true);
                  }}
                >
                  <div className="w-0.5 h-8 rounded-full bg-muted-foreground/20 group-hover:bg-muted-foreground/40 transition-colors" />
                </div>

                {/* Copilot Content */}
                <div className="flex-1 h-full overflow-hidden border-l border-border bg-card">
                  <CopilotPanel />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    );
  }
