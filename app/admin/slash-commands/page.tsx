"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SlashCommand {
    id: string;
    title: string;
    description: string | null;
    icon: string | null;
    searchTerms: string | null;
    prompt: string;
    model: string | null;
    provider: string | null;
    isActive: boolean;
    isSystem: boolean;
    userId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface CommandFormData {
    title: string;
    description: string;
    icon: string;
    searchTerms: string;
    prompt: string;
    model: string;
    provider: string;
}

const defaultFormData: CommandFormData = {
    title: "",
    description: "",
    icon: "",
    searchTerms: "",
    prompt: "",
    model: "gpt-4",
    provider: "openai",
};

export default function SlashCommandsAdminPage() {
    const [commands, setCommands] = useState<SlashCommand[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCommand, setEditingCommand] = useState<SlashCommand | null>(null);
    const [formData, setFormData] = useState<CommandFormData>(defaultFormData);

    const fetchCommands = async () => {
        try {
            const response = await fetch("/api/slash-commands");
            if (response.ok) {
                const data = await response.json();
                setCommands(data);
            } else {
                toast.error("Failed to fetch commands");
            }
        } catch (error) {
            toast.error("Error loading commands");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommands();
    }, []);

    const handleCreate = async () => {
        try {
            const response = await fetch("/api/slash-commands", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Command created successfully");
                setDialogOpen(false);
                setFormData(defaultFormData);
                fetchCommands();
            } else {
                toast.error("Failed to create command");
            }
        } catch (error) {
            toast.error("Error creating command");
        }
    };

    const handleUpdate = async () => {
        if (!editingCommand) return;

        try {
            const response = await fetch(`/api/slash-commands/${editingCommand.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Command updated successfully");
                setDialogOpen(false);
                setEditingCommand(null);
                setFormData(defaultFormData);
                fetchCommands();
            } else {
                toast.error("Failed to update command");
            }
        } catch (error) {
            toast.error("Error updating command");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this command?")) return;

        try {
            const response = await fetch(`/api/slash-commands/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Command deleted successfully");
                fetchCommands();
            } else {
                toast.error("Failed to delete command");
            }
        } catch (error) {
            toast.error("Error deleting command");
        }
    };

    const openEditDialog = (command: SlashCommand) => {
        setEditingCommand(command);
        setFormData({
            title: command.title,
            description: command.description || "",
            icon: command.icon || "",
            searchTerms: command.searchTerms || "",
            prompt: command.prompt,
            model: command.model || "gpt-4",
            provider: command.provider || "openai",
        });
        setDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingCommand(null);
        setFormData(defaultFormData);
        setDialogOpen(true);
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-emerald-600" />
                        Slash Commands
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage AI-powered slash commands for your editor
                    </p>
                </div>
                <Button onClick={openCreateDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Command
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {commands.map((command) => (
                        <Card key={command.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {command.icon && <span>{command.icon}</span>}
                                            {command.title}
                                            {command.isSystem && (
                                                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                                    System
                                                </span>
                                            )}
                                        </CardTitle>
                                        <CardDescription>{command.description}</CardDescription>
                                    </div>
                                    {!command.isSystem && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditDialog(command)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(command.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 text-sm">
                                    <div>
                                        <span className="font-medium">Prompt:</span>
                                        <p className="text-muted-foreground mt-1">{command.prompt}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div>
                                            <span className="font-medium">Model:</span> {command.model}
                                        </div>
                                        <div>
                                            <span className="font-medium">Provider:</span> {command.provider}
                                        </div>
                                    </div>
                                    {command.searchTerms && (
                                        <div>
                                            <span className="font-medium">Search Terms:</span> {command.searchTerms}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCommand ? "Edit Command" : "Create New Command"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCommand
                                ? "Update the slash command settings"
                                : "Create a custom AI slash command for your editor"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="e.g., Make Professional"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="e.g., Make the text sound more professional"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="icon">Icon (emoji or lucide icon name)</Label>
                            <Input
                                id="icon"
                                value={formData.icon}
                                onChange={(e) =>
                                    setFormData({ ...formData, icon: e.target.value })
                                }
                                placeholder="e.g., ✨ or Sparkles"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="searchTerms">Search Terms (comma-separated)</Label>
                            <Input
                                id="searchTerms"
                                value={formData.searchTerms}
                                onChange={(e) =>
                                    setFormData({ ...formData, searchTerms: e.target.value })
                                }
                                placeholder="e.g., professional,formal,business"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="prompt">Prompt *</Label>
                            <Textarea
                                id="prompt"
                                value={formData.prompt}
                                onChange={(e) =>
                                    setFormData({ ...formData, prompt: e.target.value })
                                }
                                placeholder="e.g., Rewrite the following text to sound more professional and business-appropriate..."
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="provider">Provider</Label>
                                <Select
                                    value={formData.provider}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, provider: value })
                                    }
                                >
                                    <SelectTrigger id="provider">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="openai">OpenAI</SelectItem>
                                        <SelectItem value="anthropic">Anthropic</SelectItem>
                                        <SelectItem value="google">Google</SelectItem>
                                        <SelectItem value="z.ai">Z.AI</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="model">Model</Label>
                                <Select
                                    value={formData.model}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, model: value })
                                    }
                                >
                                    <SelectTrigger id="model">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                        <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={editingCommand ? handleUpdate : handleCreate}
                            disabled={!formData.title || !formData.prompt}
                        >
                            {editingCommand ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
