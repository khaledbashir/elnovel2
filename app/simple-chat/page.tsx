"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { DmsLeftNav } from "@/components/dms/left-nav";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/tailwind/ui/theme-toggle";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export default function SimpleChatPage() {
  const [isNavSidebarCollapsed, setIsNavSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
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
          <div className="flex-1 h-full overflow-y-auto relative">
            <TailwindAdvancedEditor documentId={null} workspaceId={null} />
             <CopilotSidebar
                defaultOpen={true}
                clickOutsideToClose={false}
                labels={{
                    title: "Copilot Assistant",
                    initial: "Hi! I can help you edit this document. Try asking me to generate content or summarize the text.",
                }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}