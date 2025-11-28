"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Edit2, Trash2, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  description?: string;
  system_instructions: string;
  icon: string;
  is_default: boolean;
}

const EMOJI_OPTIONS = [
  "🤖", "💡", "👨‍💻", "📄", "🎨", "🔬", "📊", "✍️",
  "🎯", "🚀", "💻", "📝", "🧠", "⚡", "🌟", "🔥"
];

interface AgentBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentBuilder({ open, onOpenChange }: AgentBuilderProps) {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingAgent, setEditingAgent] = React.useState<Agent | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    system_instructions: "",
    icon: "🤖",
    is_default: false,
  });

  // Load agents
  const loadAgents = React.useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgents(data);
    } catch (error) {
      console.error("Failed to load agents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      loadAgents();
    }
  }, [open, loadAgents]);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          systemInstructions: formData.system_instructions,
          icon: formData.icon,
          isDefault: formData.is_default,
        }),
      });

      if (res.ok) {
        await loadAgents();
        resetForm();
      }
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingAgent) return;

    try {
      const res = await fetch(`/api/agents/${editingAgent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          systemInstructions: formData.system_instructions,
          icon: formData.icon,
          isDefault: formData.is_default,
        }),
      });

      if (res.ok) {
        await loadAgents();
        resetForm();
      }
    } catch (error) {
      console.error("Failed to update agent:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadAgents();
      }
    } catch (error) {
      console.error("Failed to delete agent:", error);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/agents/${id}/set-default`, { method: "POST" });
      if (res.ok) {
        await loadAgents();
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
      system_instructions: agent.system_instructions,
      icon: agent.icon,
      is_default: agent.is_default,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      system_instructions: "",
      icon: "🤖",
      is_default: false,
    });
    setEditingAgent(null);
    setShowForm(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-2xl max-h-[90vh] overflow-hidden",
            "bg-background rounded-lg shadow-lg border z-50"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Agent Builder
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-muted rounded-md transition-colors">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
            {showForm ? (
              <div className="space-y-4">
                <h3 className="font-medium">
                  {editingAgent ? "Edit Agent" : "Create New Agent"}
                </h3>

                {/* Icon Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">Icon</label>
                  <div className="flex gap-2 flex-wrap">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={cn(
                          "text-2xl p-2 rounded-md border-2 transition-colors",
                          formData.icon === emoji
                            ? "border-primary bg-primary/10"
                            : "border-transparent hover:border-muted"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="e.g., Code Expert"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="Brief description of the agent"
                  />
                </div>

                {/* System Instructions */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    System Instructions *
                  </label>
                  <textarea
                    value={formData.system_instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, system_instructions: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background min-h-[150px] font-mono text-sm"
                    placeholder="Define how this agent should behave..."
                  />
                </div>

                {/* Set as Default */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is-default"
                    checked={formData.is_default}
                    onChange={(e) =>
                      setFormData({ ...formData, is_default: e.target.checked })
                    }
                    className="rounded"
                  />
                  <label htmlFor="is-default" className="text-sm">
                    Set as default agent
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingAgent ? handleUpdate : handleCreate}
                    disabled={!formData.name || !formData.system_instructions}
                    className={cn(
                      "px-4 py-2 rounded-md transition-colors",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {editingAgent ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowForm(true)}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 p-3 mb-4",
                    "border-2 border-dashed rounded-lg",
                    "hover:bg-muted transition-colors"
                  )}
                >
                  <Plus className="h-4 w-4" />
                  Create New Agent
                </button>

                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading agents...
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No agents yet. Create your first agent above!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="text-2xl flex-shrink-0">{agent.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{agent.name}</h4>
                            {agent.is_default && (
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                          {agent.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {agent.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-mono">
                            {agent.system_instructions}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {!agent.is_default && (
                            <button
                              onClick={() => handleSetDefault(agent.id)}
                              className="p-1.5 hover:bg-muted rounded-md transition-colors"
                              title="Set as default"
                            >
                              <Star className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(agent)}
                            className="p-1.5 hover:bg-muted rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(agent.id)}
                            className="p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
