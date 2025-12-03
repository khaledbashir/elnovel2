"use client";

import { useState, useEffect, useRef } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
import { AgentBuilder } from "@/components/agents/agent-builder";
import { Settings, Bot, MessageSquare, Pencil, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  description?: string;
  system_instructions: string;
  icon: string;
  is_default: boolean;
}

type ChatMode = "chat" | "edit";

interface CopilotPanelProps {
  className?: string;
}

export function CopilotPanel({ className }: CopilotPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [showAgentBuilder, setShowAgentBuilder] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [mode, setMode] = useState<ChatMode>("chat");

  // Load agents
  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch("/api/agents");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAgents(data);
            const defaultAgent = data.find((a: Agent) => a.is_default) || data[0];
            setSelectedAgent(defaultAgent);
          }
        }
      } catch (error) {
        console.error("Failed to load agents:", error);
      } finally {
        setLoadingAgents(false);
      }
    }
    loadAgents();
  }, []);

  // Fix Enter key in CopilotKit input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the event target is a textarea inside the CopilotKit input
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' && target.closest('.copilot-chat-container')) {
        if (e.key === 'Enter' && !e.shiftKey) {
          // Prevent default behavior (new line)
          e.preventDefault();
          
          // Find the submit button and click it
          const submitButton = document.querySelector('.copilot-chat-container button[type="submit"], .copilot-chat-container [data-testid="send-button"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
          }
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Expose mode and agent to CopilotKit
  useCopilotReadable({
    description: "Current chat mode and AI agent personality",
    value: JSON.stringify({
      mode,
      modeDescription: mode === "chat" 
        ? "CHAT MODE: Answer questions, have conversations, help brainstorm. Do NOT modify the document unless explicitly asked."
        : "EDIT MODE: Actively help edit the document. Use the available actions to insert, modify, or format content in the editor.",
      agentInstructions: selectedAgent?.system_instructions || "You are a helpful AI writing assistant.",
    }),
  });

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentDropdown(false);
  };

  const getInitialMessage = () => {
    if (mode === "chat") {
      return "I'm in Chat mode. Ask me anything about your document, brainstorm ideas, or get help with research.";
    }
    return "I'm in Edit mode. Tell me what to write, edit, or format and I'll update the document directly.";
  };

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      {/* Header - Agent Selector only */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
        {/* Agent Selector */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowAgentDropdown(!showAgentDropdown)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted transition-colors text-sm w-full"
          >
            <span className="text-base">{selectedAgent?.icon || "🤖"}</span>
            <span className="font-medium truncate flex-1 text-left">
              {loadingAgents ? "Loading..." : (selectedAgent?.name || "Assistant")}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
          </button>

          {/* Agent Dropdown */}
          {showAgentDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAgentDropdown(false)} 
              />
              <div className="absolute top-full left-0 mt-1 z-50 min-w-[200px] bg-popover border border-border rounded-md shadow-lg py-1">
                {agents.length > 0 ? (
                  agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentSelect(agent)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                        selectedAgent?.id === agent.id && "bg-accent"
                      )}
                    >
                      <span className="text-base">{agent.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{agent.name}</div>
                        {agent.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {agent.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No agents configured
                  </div>
                )}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowAgentDropdown(false);
                      setShowAgentBuilder(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left text-primary"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Manage Agents</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CopilotKit Chat */}
      <div className="flex-1 overflow-hidden copilot-chat-container">
        <CopilotChat
          className="h-full"
          labels={{
            title: selectedAgent?.name || "Assistant",
            initial: getInitialMessage(),
          }}
        />
      </div>

      {/* Bottom Bar - Mode Toggle */}
      <div className="px-3 py-2 border-t border-border bg-card/50 flex items-center justify-center gap-1">
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setMode("chat")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              mode === "chat" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Chat mode - Ask questions, brainstorm"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setMode("edit")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              mode === "edit" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Edit mode - Modify the document"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Agent Builder Modal */}
      <AgentBuilder
        open={showAgentBuilder}
        onOpenChange={setShowAgentBuilder}
      />
    </div>
  );
}
