import { Chat } from "@/components/chat";
import { generateUUID } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleChat } from "@/components/chat/simple-chat";

// ... (keep theme definition if needed for other things, but Chat handles its own UI)

export function GenerativeUIPanel({ onClose, onNewThread }: { onClose: () => void, onNewThread?: () => void }) {
    const [threadId, setThreadId] = useState<string>("");
    const [initialMessages, setInitialMessages] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Fetch chat history on mount
    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const lastThreadId = localStorage.getItem('lastThreadId');

                if (lastThreadId) {
                    setThreadId(lastThreadId);
                    console.log("Fetching history for thread:", lastThreadId);
                    const response = await fetch(`/api/chat/history?threadId=${lastThreadId}`);
                    if (response.ok) {
                        const history = await response.json();
                        if (Array.isArray(history) && history.length > 0) {
                            const formattedMessages = history.map((msg: any) => ({
                                id: msg.id,
                                role: msg.role,
                                content: msg.content,
                            }));
                            setInitialMessages(formattedMessages);
                        }
                    }
                } else {
                    const newId = generateUUID();
                    setThreadId(newId);
                    localStorage.setItem('lastThreadId', newId);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
                // Fallback to new thread
                const newId = generateUUID();
                setThreadId(newId);
            } finally {
                setIsLoadingHistory(false);
            }
        };
        fetchHistory();
    }, []);

    const handleNewChat = () => {
        const newId = generateUUID();
        setThreadId(newId);
        localStorage.setItem('lastThreadId', newId);
        setInitialMessages([]);
        if (onNewThread) {
            onNewThread();
        }
    };

    if (isLoadingHistory) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }



    return (
        <div className="flex h-full w-full flex-col bg-background">
            <div className="flex items-center justify-between border-b p-3">
                <h2 className="text-sm font-semibold">AI Workbench</h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNewChat}
                        className="text-xs"
                    >
                        New Chat
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <SimpleChat threadId={threadId} className="h-full" />
            </div>
        </div>
    );
}
