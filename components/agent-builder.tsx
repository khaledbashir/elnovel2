"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Edit, Trash2, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
    id: string;
    name: string;
    description: string | null;
    systemInstructions: string;
    isDefault: boolean;
    icon: string | null;
    createdAt: string;
    updatedAt: string;
}

interface AgentBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onAgentSelect?: (agent: Agent) => void;
}

export function AgentBuilder({ isOpen, onClose, onAgentSelect }: AgentBuilderProps) {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        systemInstructions: "",
        isDefault: false,
        icon: "🤖",
    });

    const emojiOptions = ["🤖", "💼", "📝", "🎯", "💡", "🚀", "⚡", "🎨", "📊", "🔧"];

    useEffect(() => {
        if (isOpen) {
            fetchAgents();
        }
    }, [isOpen]);

    const fetchAgents = async () => {
        try {
            const response = await fetch("/api/agents");
            if (response.ok) {
                const data = await response.json();
                setAgents(data);
            }
        } catch (error) {
            console.error("Failed to fetch agents:", error);
        }
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.systemInstructions) {
            alert("Name and system instructions are required");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchAgents();
                resetForm();
                setIsCreating(false);
            }
        } catch (error) {
            console.error("Failed to create agent:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingAgent) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/agents/${editingAgent.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchAgents();
                resetForm();
                setEditingAgent(null);
            }
        } catch (error) {
            console.error("Failed to update agent:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this agent?")) return;

        try {
            const response = await fetch(`/api/agents/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await fetchAgents();
            }
        } catch (error) {
            console.error("Failed to delete agent:", error);
        }
    };

    const handleSetDefault = async (agent: Agent) => {
        try {
            const response = await fetch(`/api/agents/${agent.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...agent, isDefault: true }),
            });

            if (response.ok) {
                await fetchAgents();
            }
        } catch (error) {
            console.error("Failed to set default agent:", error);
        }
    };

    const startEdit = (agent: Agent) => {
        setEditingAgent(agent);
        setFormData({
            name: agent.name,
            description: agent.description || "",
            systemInstructions: agent.systemInstructions,
            isDefault: agent.isDefault,
            icon: agent.icon || "🤖",
        });
        setIsCreating(false);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            systemInstructions: "",
            isDefault: false,
            icon: "🤖",
        });
        setEditingAgent(null);
        setIsCreating(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">Agent Builder</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Agent List */}
                    <div className="w-1/3 border-r border-border overflow-y-auto p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Your Agents</h3>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setIsCreating(true);
                                }}
                                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {agents.map((agent) => (
                                <div
                                    key={agent.id}
                                    className={cn(
                                        "p-3 rounded-lg border cursor-pointer transition-all",
                                        editingAgent?.id === agent.id
                                            ? "bg-primary/10 border-primary"
                                            : "hover:bg-accent border-border"
                                    )}
                                    onClick={() => startEdit(agent)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-2 flex-1">
                                            <span className="text-2xl">{agent.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium truncate">
                                                        {agent.name}
                                                    </h4>
                                                    {agent.isDefault && (
                                                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                {agent.description && (
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {agent.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {!agent.isDefault && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSetDefault(agent);
                                                    }}
                                                    className="p-1 hover:bg-primary/10 rounded transition-colors"
                                                    title="Set as default"
                                                >
                                                    <Check className="w-4 h-4 text-primary" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(agent.id);
                                                }}
                                                className="p-1 hover:bg-destructive/10 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {agents.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-sm">No agents yet</p>
                                    <p className="text-xs mt-1">Create your first agent!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {(isCreating || editingAgent) ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">
                                        {editingAgent ? "Edit Agent" : "Create New Agent"}
                                    </h3>
                                </div>

                                {/* Icon Selector */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Icon
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {emojiOptions.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() =>
                                                    setFormData({ ...formData, icon: emoji })
                                                }
                                                className={cn(
                                                    "text-2xl p-2 rounded-lg border transition-all",
                                                    formData.icon === emoji
                                                        ? "bg-primary/10 border-primary scale-110"
                                                        : "border-border hover:bg-accent"
                                                )}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Agent Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="e.g., SOW Expert, Content Writer"
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Brief description of what this agent does"
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                {/* System Instructions */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        System Instructions *
                                    </label>
                                    <textarea
                                        value={formData.systemInstructions}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                systemInstructions: e.target.value,
                                            })
                                        }
                                        placeholder="You are a helpful assistant that..."
                                        rows={12}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Define the agent's personality, expertise, and behavior
                                    </p>
                                </div>

                                {/* Set as Default */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        checked={formData.isDefault}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                isDefault: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 rounded border-border"
                                    />
                                    <label htmlFor="isDefault" className="text-sm">
                                        Set as default agent
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={resetForm}
                                        className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={editingAgent ? handleUpdate : handleCreate}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading
                                            ? "Saving..."
                                            : editingAgent
                                                ? "Update Agent"
                                                : "Create Agent"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                                <div>
                                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No agent selected</p>
                                    <p className="text-sm mt-1">
                                        Select an agent to edit or create a new one
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
