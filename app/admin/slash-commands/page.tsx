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
} from "@/components/tailwind/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Sparkles, MoreHorizontal, Check } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
    const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);

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
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <div className="flex-shrink-0 h-full bg-card border-r border-border w-80">
                <Sidebar
                    selectedDocument={selectedDocument}
                    selectedWorkspace={selectedWorkspace}
                    onDocumentSelect={setSelectedDocument}
                    onWorkspaceSelect={setSelectedWorkspace}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                                        <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    Slash Commands
                                </h1>
                                <p className="text-muted-foreground mt-2 text-lg">
                                    Create and manage custom AI actions for your editor
                                </p>
                            </div>
                            <Button onClick={openCreateDialog} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                                <Plus className="h-4 w-4" />
                                Create Command
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
                                <p>Loading commands...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {commands.map((command) => (
                                    <Card key={command.id} className="group relative overflow-hidden border-border/50 bg-card hover:bg-accent/5 hover:border-emerald-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-all duration-300" />
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl shadow-inner">
                                                        {command.icon || <Sparkles className="h-5 w-5 text-muted-foreground" />}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg font-semibold leading-tight">
                                                            {command.title}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {command.isSystem && (
                                                                <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                                                    System
                                                                </Badge>
                                                            )}
                                                            <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 rounded">
                                                                /{command.title.toLowerCase().replace(/\s+/g, '-')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {!command.isSystem && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openEditDialog(command)}>
                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDelete(command.id)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                            {command.description && (
                                                <CardDescription className="mt-2 line-clamp-2 text-sm">
                                                    {command.description}
                                                </CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 pt-2 border-t border-border/40">
                                                <div>
                                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Prompt</div>
                                                    <p className="text-sm text-foreground/80 line-clamp-3 bg-muted/30 p-2 rounded-md border border-border/30 font-mono text-xs">
                                                        {command.prompt}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-2 h-2 rounded-full ${command.provider === 'openai' ? 'bg-green-500' : 'bg-purple-500'}`} />
                                                        {command.provider} / {command.model}
                                                    </div>
                                                    {command.searchTerms && (
                                                        <div className="max-w-[120px] truncate" title={command.searchTerms}>
                                                            {command.searchTerms}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-card border-border shadow-2xl sm:rounded-xl">
                    <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
                        <DialogTitle className="text-xl">
                            {editingCommand ? "Edit Command" : "Create New Command"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCommand
                                ? "Update the slash command settings"
                                : "Create a custom AI slash command for your editor"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Make Professional"
                                    className="bg-background border-input focus:ring-emerald-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="icon" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</Label>
                                <Input
                                    id="icon"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="e.g. ✨"
                                    className="bg-background border-input focus:ring-emerald-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What does this command do?"
                                className="bg-background border-input focus:ring-emerald-500/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prompt" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Prompt</Label>
                            <Textarea
                                id="prompt"
                                value={formData.prompt}
                                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                placeholder="You are an AI assistant that..."
                                className="min-h-[120px] font-mono text-sm bg-background border-input focus:ring-emerald-500/20 resize-y"
                            />
                            <p className="text-xs text-muted-foreground">
                                This is the instruction sent to the AI model. Be specific about the tone and format.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                            <div className="space-y-2">
                                <Label htmlFor="provider" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Provider</Label>
                                <Select
                                    value={formData.provider}
                                    onValueChange={(value) => setFormData({ ...formData, provider: value })}
                                >
                                    <SelectTrigger id="provider" className="bg-background">
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

                            <div className="space-y-2">
                                <Label htmlFor="model" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model</Label>
                                <Select
                                    value={formData.model}
                                    onValueChange={(value) => setFormData({ ...formData, model: value })}
                                >
                                    <SelectTrigger id="model" className="bg-background">
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
                        
                        <div className="space-y-2">
                            <Label htmlFor="searchTerms" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Keywords</Label>
                            <Input
                                id="searchTerms"
                                value={formData.searchTerms}
                                onChange={(e) => setFormData({ ...formData, searchTerms: e.target.value })}
                                placeholder="professional, formal, business (comma separated)"
                                className="bg-background border-input focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
                        <Button variant="outline" onClick={() => setDialogOpen(false)} className="mr-2">
                            Cancel
                        </Button>
                        <Button
                            onClick={editingCommand ? handleUpdate : handleCreate}
                            disabled={!formData.title || !formData.prompt}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {editingCommand ? "Update Command" : "Create Command"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
