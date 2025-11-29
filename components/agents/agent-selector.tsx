"use client";

import * as React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Settings, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
        <span>Loading agents...</span>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm text-muted-foreground">No agents found</span>
        {onManageAgents && (
          <button
            onClick={onManageAgents}
            className="text-xs text-primary hover:underline"
          >
            Create Agent
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
      <Select.Root value={selectedAgentId} onValueChange={handleAgentChange}>
        <Select.Trigger
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md",
            "bg-muted/50 hover:bg-muted transition-colors",
            "text-sm font-medium",
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
        >
          <span className="text-base">{selectedAgent?.icon || "🤖"}</span>
          <Select.Value>
            {selectedAgent?.name || "Select Agent"}
          </Select.Value>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className={cn(
              "overflow-hidden rounded-md border bg-popover shadow-md",
              "z-50 min-w-[200px]"
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
                    "relative flex items-center gap-2 px-2 py-1.5 rounded-sm",
                    "text-sm outline-none cursor-pointer",
                    "hover:bg-accent focus:bg-accent",
                    "data-[state=checked]:bg-accent"
                  )}
                >
                  <span className="text-base">{agent.icon}</span>
                  <div className="flex-1">
                    <Select.ItemText>
                      <div className="font-medium">{agent.name}</div>
                      {agent.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {agent.description}
                        </div>
                      )}
                    </Select.ItemText>
                  </div>
                  {selectedAgentId === agent.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {onManageAgents && (
        <button
          onClick={onManageAgents}
          className={cn(
            "p-1.5 rounded-md hover:bg-muted transition-colors",
            "text-muted-foreground hover:text-foreground"
          )}
          title="Manage Agents"
        >
          <Settings className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
