"use client";

import { useChat } from "ai/react";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface MinimalChatProps {
    threadId: string;
    className?: string;
}

export function MinimalChat({ threadId, className }: MinimalChatProps) {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        id: threadId,
        api: "/api/chat",
        body: {
            id: threadId,
        },
    });

    return (
        <div className={cn("flex h-full w-full flex-col bg-background", className)}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Start a conversation
                    </div>
                )}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            "flex",
                            message.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[80%] rounded-lg px-4 py-2",
                                message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                            )}
                        >
                            {message.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t p-4">
                <div className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="min-h-[60px] resize-none"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
