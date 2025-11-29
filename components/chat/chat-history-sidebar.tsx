"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Thread = {
    thread_id: string;
    first_message: string;
    last_message_at: string;
};

interface ChatHistorySidebarProps {
    currentThreadId: string | null;
    onSelectThread: (threadId: string) => void;
    onNewThread: () => void;
    className?: string;
}

export function ChatHistorySidebar({
    currentThreadId,
    onSelectThread,
    onNewThread,
    className
}: ChatHistorySidebarProps) {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchThreads = async () => {
            try {
                const res = await fetch("/api/chat/threads");
                if (res.ok) {
                    const data = await res.json();
                    setThreads(data.threads || []);
                }
            } catch (error) {
                console.error("Failed to load threads", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchThreads();
    }, []);

    return (
        <div className={cn("flex flex-col h-full border-r border-border bg-card/50", className)}>
            <div className="p-4 border-b border-border">
                <Button
                    onClick={onNewThread}
                    className="w-full justify-start gap-2"
                    variant="outline"
                >
                    <Plus className="h-4 w-4" />
                    New Chat
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : threads.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No history yet</div>
                ) : (
                    threads.map((thread) => (
                        <button
                            key={thread.thread_id}
                            onClick={() => onSelectThread(thread.thread_id)}
                            className={cn(
                                "w-full flex items-start gap-3 p-3 rounded-lg text-left text-sm transition-colors",
                                currentThreadId === thread.thread_id
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                    {thread.first_message || "New Conversation"}
                                </div>
                                <div className="text-xs opacity-70 mt-1">
                                    {new Date(thread.last_message_at).toLocaleDateString()}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
