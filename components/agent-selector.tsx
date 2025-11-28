"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Sparkles, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
    id: string;
    name: string;
    description: string | null;
    systemInstructions: string;
    isDefault: boolean;
    icon: string | null;
}

interface AgentSelectorProps {
    selectedAgent: Agent | null;
    onAgentChange: (agent: Agent) => void;
    onOpenBuilder?: () => void;
    className?: string;
}

export function AgentSelector({
    selectedAgent,
    onAgentChange,
    onOpenBuilder,
    className,
}: AgentSelectorProps) {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const response = await fetch("/api/agents");
            if (response.ok) {
                const data = await response.json();
                setAgents(data);

                // Auto-select default agent if no agent is selected
                if (!selectedAgent && data.length > 0) {
                    const defaultAgent = data.find((a: Agent) => a.isDefault) || data[0];
                    onAgentChange(defaultAgent);
                }
            }
        } catch (error) {
            console.error("Failed to fetch agents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (agent: Agent) => {
        onAgentChange(agent);
        setIsOpen(false);
    };

    if (isLoading) {
        return (
            <div className={cn("animate-pulse", className)}>
                <div className="h-10 bg-accent rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className={cn("relative", className)}>
            {/* Selected Agent Display */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xl">{selectedAgent?.icon || "🤖"}</span>
                    <div className="flex-1 text-left min-w-0">
                        <div className="font-medium truncate">
                            {selectedAgent?.name || "Select Agent"}
                        </div>
                        {selectedAgent?.description && (
                            <div className="text-xs text-muted-foreground truncate">
                                {selectedAgent.description}
                            </div>
                        )}
                    </div>
                </div>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 transition-transform",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
                        {agents.map((agent) => (
                            <button
                                key={agent.id}
                                onClick={() => handleSelect(agent)}
                                className={cn(
                                    "w-full flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors text-left",
                                    selectedAgent?.id === agent.id && "bg-primary/10"
                                )}
                            >
                                <span className="text-2xl">{agent.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium">{agent.name}</div>
                                        {agent.isDefault && (
                                            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    {agent.description && (
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {agent.description}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}

                        {agents.length === 0 && (
                            <div className="px-4 py-8 text-center text-muted-foreground">
                                <p className="text-sm">No agents available</p>
                            </div>
                        )}

                        {/* Manage Agents Button */}
                        {onOpenBuilder && (
                            <div className="border-t border-border">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        onOpenBuilder();
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-accent transition-colors text-primary"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="font-medium">Manage Agents</span>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
