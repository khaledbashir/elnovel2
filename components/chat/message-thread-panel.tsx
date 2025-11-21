"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Send,
    Bot,
    User,
    History,
    Settings,
    MessageSquare,
} from "lucide-react";

interface Message {
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp: Date;
}

export const MessageThreadPanel = React.forwardRef<
    HTMLDivElement,
    {
        contextKey?: string;
        className?: string;
        style?: React.CSSProperties;
    }
>(({ contextKey, className, style, ...props }, ref) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "Hello! I'm your AI assistant. How can I help you today?",
            sender: "assistant",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [threadTitle, setThreadTitle] = useState("New Conversation");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content:
                    "This is a placeholder response. In a real implementation, this would connect to an AI service.",
                sender: "assistant",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setIsTyping(false);
        }, 1000);
    };

    const handleNewConversation = () => {
        setMessages([
            {
                id: "1",
                content:
                    "Hello! I'm your AI assistant. How can I help you today?",
                sender: "assistant",
                timestamp: new Date(),
            },
        ]);
        setShowHistory(false);
    };

    return (
        <div
            ref={ref}
            className={`flex flex-col h-full bg-background ${className || ""}`}
            style={style}
            {...props}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-3">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <h3 className="font-medium text-sm truncate max-w-[150px]">
                        {threadTitle}
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        className="h-7 w-7"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        <History className="h-4 w-4" />
                    </Button>
                    <Button
                        className="h-7 w-7"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${
                                message.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <Card
                                className={`max-w-[80%] ${
                                    message.sender === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : ""
                                }`}
                            >
                                <CardHeader className="pb-2 pt-3 px-3">
                                    <div className="flex items-center gap-2">
                                        {message.sender === "assistant" ? (
                                            <Bot className="h-4 w-4" />
                                        ) : (
                                            <User className="h-4 w-4" />
                                        )}
                                        <CardTitle className="text-sm">
                                            {message.sender === "assistant"
                                                ? "Assistant"
                                                : "You"}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-3 pb-3 pt-0">
                                    <p className="text-sm">{message.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                        {message.timestamp.toLocaleTimeString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <Card className="max-w-[80%]">
                                <CardContent className="px-3 py-3">
                                    <div className="flex items-center gap-2">
                                        <Bot className="h-4 w-4" />
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse"></div>
                                            <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse delay-75"></div>
                                            <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse delay-150"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* History Sidebar */}
                {showHistory && (
                    <div className="w-60 border-l bg-card p-3 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">History</h4>
                            <Button
                                onClick={handleNewConversation}
                                className="text-xs px-2 py-1 h-auto"
                            >
                                New
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <div className="p-2 rounded-md border cursor-pointer hover:bg-accent text-sm">
                                <div className="font-medium">
                                    Current Conversation
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {messages[0]?.content.substring(0, 30)}...
                                </div>
                            </div>
                            <div className="p-2 rounded-md border cursor-pointer hover:bg-accent text-sm">
                                <div className="font-medium">
                                    Previous Conversation
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    How to optimize Next.js performance...
                                </div>
                            </div>
                            <div className="p-2 rounded-md border cursor-pointer hover:bg-accent text-sm">
                                <div className="font-medium">
                                    UI Design Tips
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    What are the best practices for...
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Sidebar */}
                {showSettings && (
                    <div className="w-60 border-l bg-card p-3 overflow-y-auto">
                        <h4 className="text-sm font-medium mb-3">Settings</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium">
                                    Model
                                </label>
                                <select className="w-full mt-1 px-2 py-1 text-sm border rounded bg-background">
                                    <option>GPT-4</option>
                                    <option>Claude</option>
                                    <option>Local Model</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium">
                                    Temperature
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    defaultValue="0.7"
                                    className="w-full mt-1 accent-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">
                                    Max Length
                                </label>
                                <input
                                    type="number"
                                    defaultValue="2048"
                                    className="w-full mt-1 px-2 py-1 text-sm border rounded bg-background"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="streaming"
                                    defaultChecked
                                    className="accent-primary"
                                />
                                <label htmlFor="streaming" className="text-sm">
                                    Enable streaming
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInputValue(e.target.value)
                        }
                        placeholder="Type your message..."
                        className="flex-1"
                        onKeyPress={(
                            e: React.KeyboardEvent<HTMLInputElement>,
                        ) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button
                        onClick={handleSendMessage}
                        className="h-10 w-10 p-0"
                        disabled={!inputValue.trim() || isTyping}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
});

MessageThreadPanel.displayName = "MessageThreadPanel";
