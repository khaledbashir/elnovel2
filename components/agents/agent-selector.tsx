"use client";

import * as React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/db/agents";

interface AgentSelectorProps {
  onManageAgents?: () => void;
  onAgentSelect?: (agent: Agent) => void;
}

export function AgentSelector({ onManageAgents, onAgentSelect }: AgentSelectorProps) {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);

  // Load agents
  React.useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch("/api/agents");
        const data = await res.json();

        if (Array.isArray(data)) {
          setAgents(data);

          // Auto-select default agent
          const defaultAgent = data.find((a: Agent) => a.is_default);
          if (defaultAgent) {
            setSelectedAgentId(defaultAgent.id);
            if (onAgentSelect) {
              onAgentSelect(defaultAgent);
            }
          }
        } else {
          console.error("Failed to load agents:", data);
          setAgents([]);
        }
      } catch (error) {
        console.error("Failed to load agents:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, [onAgentSelect]);

  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId);
    const agent = agents.find((a) => a.id === agentId);

    if (agent && onAgentSelect) {
      onAgentSelect(agent);
    }
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-base">🤖</span>
        <span>Loading...</span>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <button
        onClick={onManageAgents}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="text-base">🤖</span>
        <span>Create Agent</span>
      </button>
    );
  }

  return (
    <Select.Root value={selectedAgentId} onValueChange={handleAgentChange}>
      <Select.Trigger
        className={cn(
          "flex items-center gap-2 px-2 py-1 rounded-md",
          "bg-transparent hover:bg-muted/50 transition-colors",
          "text-sm font-medium",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          "min-w-0 flex-1"
        )}
      >
        <span className="text-base shrink-0">{selectedAgent?.icon || "🤖"}</span>
        <Select.Value className="truncate">
          {selectedAgent?.name || "Select Agent"}
        </Select.Value>
        <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className={cn(
            "overflow-hidden rounded-md border bg-popover shadow-lg",
            "z-[100] min-w-[220px]"
          )}
          position="popper"
          sideOffset={5}
        >
          <Select.Viewport className="p-1">
            {agents.map((agent) => (
              <Select.Item
                key={agent.id}
                value={agent.id}
                className={cn(
                  "relative flex items-center gap-2 px-2 py-2 rounded-sm",
                  "text-sm outline-none cursor-pointer",
                  "hover:bg-accent focus:bg-accent",
                  "data-[state=checked]:bg-accent"
                )}
              >
                <span className="text-base shrink-0">{agent.icon}</span>
                <div className="flex-1 min-w-0">
                  <Select.ItemText>
                    <div className="font-medium">{agent.name}</div>
                    {agent.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {agent.description}
                      </div>
                    )}
                  </Select.ItemText>
                </div>
                {selectedAgentId === agent.id && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
