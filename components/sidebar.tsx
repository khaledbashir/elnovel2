"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Folder,
    FileText,
    Star,
    Clock,
    ChevronDown,
    Plus,
    MoreHorizontal,
    Settings,
    Search,
    Hash
} from "lucide-react";
import { SidebarItem } from "./sidebar/sidebar-item";
import { SidebarSection } from "./sidebar/sidebar-item";
import { SidebarSearch } from "./sidebar/sidebar-search";
import { ScrollArea } from "@/components/tailwind/ui/scroll-area";
import { Button } from "@/components/tailwind/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/tailwind/ui/dropdown-menu";

interface Workspace {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

interface Document {
    id: string;
    name: string;
    workspace_id: string;
    tambo_thread_id: string;
    created_at: string;
    updated_at: string;
}

export function Sidebar({
    className,
    selectedDocument,
    selectedWorkspace,
    onDocumentSelect,
    onWorkspaceSelect,
}: {
    className?: string;
    selectedDocument: string | null;
    selectedWorkspace: string | null;
    onDocumentSelect: (id: string | null) => void;
    onWorkspaceSelect: (id: string | null) => void;
}) {
    const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
    const [documents, setDocuments] = React.useState<Document[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [expandedWorkspaces, setExpandedWorkspaces] = React.useState<Set<string>>(new Set());

    // Fetch workspaces on mount
    React.useEffect(() => {
        fetchWorkspaces();
    }, []);

    // Fetch documents when a workspace is expanded or selected
    React.useEffect(() => {
        if (selectedWorkspace) {
            fetchDocuments(selectedWorkspace);
            setExpandedWorkspaces(prev => new Set(Array.from(prev).concat([selectedWorkspace])));
        }
    }, [selectedWorkspace]);

    const fetchWorkspaces = async () => {
        try {
            const response = await fetch("/api/workspaces");
            const data = await response.json();
            if (Array.isArray(data)) {
                setWorkspaces(data);
            }
        } catch (error) {
            console.error("Failed to fetch workspaces:", error);
        }
    };

    const fetchDocuments = async (workspaceId: string) => {
        try {
            const response = await fetch(`/api/documents?workspaceId=${workspaceId}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setDocuments(prev => {
                    // Remove existing documents for this workspace to avoid duplicates
                    const filtered = prev.filter(d => d.workspace_id !== workspaceId);
                    return [...filtered, ...data];
                });
            }
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        }
    };

    const handleCreateWorkspace = async () => {
        const name = prompt("Enter workspace name:");
        if (!name) return;

        try {
            const response = await fetch("/api/workspaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            const newWorkspace = await response.json();
            setWorkspaces(prev => [newWorkspace, ...prev]);
            onWorkspaceSelect(newWorkspace.id);
        } catch (error) {
            console.error("Failed to create workspace:", error);
        }
    };

    const handleCreateDocument = async (workspaceId: string) => {
        const title = prompt("Enter document title:");
        if (!title) return;

        try {
            const response = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, workspace_id: workspaceId }),
            });
            const newDoc = await response.json();
            setDocuments(prev => [newDoc, ...prev]);
            onDocumentSelect(newDoc.id);
        } catch (error) {
            console.error("Failed to create document:", error);
        }
    };

    const toggleWorkspace = (workspaceId: string) => {
        setExpandedWorkspaces(prev => {
            const next = new Set(prev);
            if (next.has(workspaceId)) {
                next.delete(workspaceId);
            } else {
                next.add(workspaceId);
            }
            return next;
        });
    };

    const deleteWorkspace = async (id: string) => {
        if (!confirm("Delete this workspace and all its documents?")) return;
        try {
            await fetch(`/api/workspaces/${id}`, { method: "DELETE" });
            fetchWorkspaces();
            if (selectedWorkspace === id) onWorkspaceSelect(null);
        } catch (error) {
            console.error("Failed to delete workspace:", error);
        }
    };

    const deleteDocument = async (id: string, workspaceId: string) => {
        if (!confirm("Delete this document?")) return;
        try {
            await fetch(`/api/documents/${id}`, { method: "DELETE" });
            fetchDocuments(workspaceId);
            if (selectedDocument === id) onDocumentSelect(null);
        } catch (error) {
            console.error("Failed to delete document:", error);
        }
    };

    return (
        <div className={cn(
            "flex flex-col h-full bg-secondary/30 border-r border-border/50 w-64",
            className
        )}>
            {/* User/Brand Header */}
            <div className="p-3 flex items-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer mb-2">
                <div className="w-5 h-5 rounded-sm bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    N
                </div>
                <span className="font-medium text-sm truncate">Novel Workspace</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground ml-auto" />
            </div>

            {/* Search */}
            <SidebarSearch onSearch={(q) => console.log(q)} />

            <ScrollArea className="flex-1 px-2">
                {/* Favorites Section (Placeholder) */}
                <SidebarSection title="Favorites" isCollapsible>
                    <div className="px-3 py-2 text-xs text-muted-foreground italic">
                        No favorites yet
                    </div>
                </SidebarSection>

                {/* Recent Section (Placeholder) */}
                <SidebarSection title="Recent" isCollapsible>
                    <SidebarItem
                        id="recent-1"
                        label="Quick Notes"
                        icon={<Clock className="w-4 h-4" />}
                        onClick={() => alert("Quick Notes feature coming soon!")}
                    />
                </SidebarSection>

                {/* Workspaces Section */}
                <SidebarSection
                    title="Workspaces"
                    action={
                        <Plus
                            className="w-4 h-4 cursor-pointer hover:text-foreground transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCreateWorkspace();
                            }}
                        />
                    }
                >
                    {workspaces.map(workspace => (
                        <div key={workspace.id}>
                            <SidebarItem
                                id={workspace.id}
                                label={workspace.name}
                                icon={<Folder className="w-4 h-4" />}
                                isActive={selectedWorkspace === workspace.id}
                                isExpanded={expandedWorkspaces.has(workspace.id)}
                                hasChildren={true}
                                onToggle={() => toggleWorkspace(workspace.id)}
                                onClick={() => {
                                    onWorkspaceSelect(workspace.id);
                                    if (!expandedWorkspaces.has(workspace.id)) {
                                        toggleWorkspace(workspace.id);
                                    }
                                }}
                                onAddChild={() => handleCreateDocument(workspace.id)}
                                onDelete={() => deleteWorkspace(workspace.id)}
                            />

                            {/* Nested Documents */}
                            {expandedWorkspaces.has(workspace.id) && (
                                <div className="relative">
                                    {/* Vertical Guide Line */}
                                    <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border/50" />

                                    {documents
                                        .filter(d => d.workspace_id === workspace.id)
                                        .map(doc => (
                                            <SidebarItem
                                                key={doc.id}
                                                id={doc.id}
                                                label={doc.name}
                                                level={1}
                                                isActive={selectedDocument === doc.id}
                                                onClick={() => onDocumentSelect(doc.id)}
                                                onDelete={() => deleteDocument(doc.id, workspace.id)}
                                            />
                                        ))
                                    }
                                    {documents.filter(d => d.workspace_id === workspace.id).length === 0 && (
                                        <div className="pl-9 py-1 text-xs text-muted-foreground italic">
                                            No documents
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </SidebarSection>

                {/* Templates Section */}
                <SidebarSection title="Templates" isCollapsible={false}>
                    <SidebarItem
                        id="tpl-1"
                        label="Project Plan"
                        icon={<FileText className="w-4 h-4" />}
                        onClick={() => alert("Templates coming soon!")}
                    />
                    <SidebarItem
                        id="tpl-2"
                        label="Meeting Notes"
                        icon={<FileText className="w-4 h-4" />}
                        onClick={() => alert("Templates coming soon!")}
                    />
                </SidebarSection>
            </ScrollArea>

            {/* Footer Actions */}
            <div className="p-2 border-t border-border/50">
                <SidebarItem
                    id="trash"
                    label="Trash"
                    icon={<MoreHorizontal className="w-4 h-4" />}
                />
                <SidebarItem
                    id="settings"
                    label="Settings"
                    icon={<Settings className="w-4 h-4" />}
                />
            </div>
        </div>
    );
}
