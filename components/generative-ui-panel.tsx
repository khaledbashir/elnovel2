"use client";

import { useState, useRef } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, Code, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { cn } from "@/lib/utils";

// Default theme for react-live
const theme = {
    plain: {
        color: "#e6e1dc",
        backgroundColor: "#2b2b2b",
    },
    styles: [
        {
            types: ["comment"],
            style: {
                color: "#bc9458",
                fontStyle: "italic" as const,
            },
        },
        {
            types: ["keyword"],
            style: {
                color: "#c26230",
            },
        },
        {
            types: ["string"],
            style: {
                color: "#a5c261",
            },
        },
    ],
};

export function GenerativeUIPanel({ onClose, onNewThread }: { onClose: () => void, onNewThread?: () => void }) {
    const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [showArtifact, setShowArtifact] = useState(true);

    // Fetch chat history on mount
    useState(() => {
        const fetchHistory = async () => {
            try {
                // Get the last active thread ID from localStorage
                const lastThreadId = localStorage.getItem('lastThreadId');

                if (lastThreadId) {
                    console.log("Fetching history for thread:", lastThreadId);
                    const response = await fetch(`/api/chat/history?threadId=${lastThreadId}`);
                    if (response.ok) {
                        const history = await response.json();
                        if (Array.isArray(history) && history.length > 0) {
                            // Convert DB messages to AI SDK format
                            const formattedMessages = history.map((msg: any) => ({
                                id: msg.id,
                                role: msg.role,
                                content: msg.content,
                                // We might need to parse tool invocations if we stored them as JSON in content
                                // But for now, simple text restoration
                            }));
                            setMessages(formattedMessages);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            }
        };
        fetchHistory();
    });

    // Save threadId to localStorage when it changes (we need to capture it from headers or response)
    // Since useChat doesn't expose threadId directly unless we manage it, we might need to rely on
    // the fact that we send it in the body. 
    // Actually, let's generate a threadId if one doesn't exist and pass it to useChat

    const [threadId, setThreadId] = useState<string>("");

    useEffect(() => {
        const stored = localStorage.getItem('lastThreadId');
        if (stored) setThreadId(stored);
        else {
            const newId = crypto.randomUUID();
            setThreadId(newId);
            localStorage.setItem('lastThreadId', newId);
        }
    }, []);

    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        api: "/api/chat",
        body: { id: threadId },
        onFinish: () => {
            // Re-fetch or update local state if needed
        }
    });

    const handleNewChat = () => {
        const newId = crypto.randomUUID();
        setThreadId(newId);
        localStorage.setItem('lastThreadId', newId);
        setMessages([]);
        setGeneratedCode(null);
        setShowArtifact(true);
        if (onNewThread) {
            onNewThread();
        }
    };

    // Parse messages to find generated components
    const lastMessage = messages[messages.length - 1];

    // Effect to extract code from tool results
    if (lastMessage?.role === 'assistant' && lastMessage.toolInvocations) {
        lastMessage.toolInvocations.forEach(tool => {
            if (tool.toolName === 'generate_component' && tool.state === 'result') {
                try {
                    const result = JSON.parse(tool.result);
                    console.log('[GenerativeUIPanel] Component generated:', result);
                    if (result.type === 'component_generated' && result.code !== generatedCode) {
                        setGeneratedCode(result.code);
                        setShowArtifact(true); // Auto-show when component is generated
                        console.log('[GenerativeUIPanel] Code set, showArtifact:', true);
                    }
                } catch (e) {
                    console.error("Failed to parse component result", e);
                }
            }
        });
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
                    {generatedCode && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowArtifact(!showArtifact)}
                            className="text-xs"
                        >
                            {showArtifact ? (
                                <>
                                    <Eye className="h-3 w-3 mr-1" />
                                    Hide Preview
                                </>
                            ) : (
                                <>
                                    <Eye className="h-3 w-3 mr-1" />
                                    Show Preview
                                </>
                            )}
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Chat Area */}
                <div className={cn(
                    "flex flex-col border-r border-border transition-all",
                    showArtifact && generatedCode ? "w-[280px]" : "flex-1"
                )}>
                    <ScrollArea className="flex-1 p-3">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "mb-3 p-2 rounded-lg text-xs",
                                    m.role === "user"
                                        ? "bg-primary text-primary-foreground ml-6"
                                        : "bg-muted mr-6"
                                )}
                            >
                                <div className="font-semibold mb-1 capitalize text-[10px]">{m.role}</div>
                                <div className="leading-relaxed">{m.content}</div>
                                {m.toolInvocations?.map((tool) => (
                                    <div key={tool.toolCallId} className="mt-2 text-[10px] bg-black/10 p-1.5 rounded">
                                        {tool.toolName === 'generate_component' ? (
                                            <div className="flex items-center gap-1.5">
                                                <Code className="h-3 w-3" />
                                                <span>Generating Component...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <Eye className="h-3 w-3" />
                                                <span>Searching Knowledge...</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs p-3">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Thinking...</span>
                            </div>
                        )}
                    </ScrollArea>
                    <div className="p-3 border-t border-border">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Ask AI..."
                                className="text-xs h-8"
                            />
                            <Button type="submit" size="sm" disabled={isLoading} className="h-8 px-3">
                                <Send className="h-3 w-3" />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Preview Area */}
                {showArtifact && generatedCode && (
                    <div className="flex-1 flex flex-col bg-muted/30 min-w-0">
                        <div className="border-b bg-background px-3 py-1.5">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                <TabsList className="h-7">
                                    <TabsTrigger value="preview" className="text-xs px-2 py-1">Preview</TabsTrigger>
                                    <TabsTrigger value="code" className="text-xs px-2 py-1">Code</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <div className="flex-1 overflow-auto p-3">
                            <LiveProvider code={generatedCode} theme={theme} noInline={false}>
                                {activeTab === 'preview' ? (
                                    <div className="border rounded-lg bg-background p-4 shadow-sm min-h-[300px] flex items-center justify-center">
                                        <LivePreview />
                                        <LiveError className="text-red-500 text-xs mt-2" />
                                    </div>
                                ) : (
                                    <LiveEditor className="rounded-lg overflow-hidden text-xs font-mono" />
                                )}
                            </LiveProvider>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
