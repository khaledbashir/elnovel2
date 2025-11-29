"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopActionBar } from "@/components/top-action-bar";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Page() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved sidebar state from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarState !== null) {
      setIsSidebarCollapsed(savedSidebarState === 'true');
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);




  return (
    <div className="fixed inset-0 flex" ref={containerRef}>
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
        onClick={() => {
          setIsSidebarCollapsed(!isSidebarCollapsed);
          localStorage.setItem('sidebarCollapsed', (!isSidebarCollapsed).toString());
        }}
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

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopActionBar
          workspaceId={selectedWorkspace}
          documentId={selectedDocument}
        />
        <div className="flex-1 overflow-hidden">
          <TailwindAdvancedEditor
            documentId={selectedDocument}
            workspaceId={selectedWorkspace}
          />
        </div>
      </div>

    </div>
  );
}
