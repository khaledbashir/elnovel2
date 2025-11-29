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
import { useChat } from "ai/react";
import { TaskCard, TaskStep } from "@/components/chat/task-card";
import { v4 as uuidv4 } from "uuid";

interface Message {
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp: Date;
    toolInvocations?: any[];
}

export const MessageThreadPanel = React.forwardRef<
    HTMLDivElement,
    {
        contextKey?: string;
        className?: string;
        style?: React.CSSProperties;
    }
>(({ contextKey, className, style, ...props }, ref) => {
    const [showHistory, setShowHistory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [threadTitle, setThreadTitle] = useState("New Conversation");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // State for agentic workflow
    const [taskPlan, setTaskPlan] = useState<{ title: string; steps: TaskStep[] } | null>(null);
    const [artifact, setArtifact] = useState<{ title: string; type: string; content: string } | null>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        api: "/api/chat",
        id: contextKey || uuidv4(),
        onFinish: (message) => {
             // Handle any post-response logic if needed
        },
    });

    // Effect to process tool invocations
    useEffect(() => {
        if (!messages.length) return;
        
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.toolInvocations) {
            lastMessage.toolInvocations.forEach(toolInvocation => {
                const { toolName, args, state } = toolInvocation;
                
                if (state === 'result') return; // Already processed? (Though for streaming we might want to see updates)
                
                if (toolName === 'create_plan') {
                    setTaskPlan({
                        title: args.title,
                        steps: args.steps.map((s: any) => ({ ...s, status: 'pending' }))
                    });
                } else if (toolName === 'update_step') {
                    setTaskPlan(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            steps: prev.steps.map(step => 
                                step.id === args.stepId 
                                    ? { ...step, status: args.status, details: args.details } 
                                    : step
                            )
                        };
                    });
                } else if (toolName === 'render_artifact') {
                    setArtifact({
                        title: args.title,
                        type: args.type,
                        content: args.content
                    });
                }
            });
        }
    }, [messages]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, taskPlan, artifact]);

    const handleNewConversation = () => {
        setMessages([]);
        setTaskPlan(null);
        setArtifact(null);
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
                                message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div className={`max-w-[90%] w-full ${message.role === 'user' ? 'ml-auto max-w-[80%]' : ''}`}>
                                <Card
                                    className={`${
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : ""
                                    }`}
                                >
                                    <CardHeader className="pb-2 pt-3 px-3">
                                        <div className="flex items-center gap-2">
                                            {message.role === "assistant" ? (
                                                <Bot className="h-4 w-4" />
                                            ) : (
                                                <User className="h-4 w-4" />
                                            )}
                                            <CardTitle className="text-sm">
                                                {message.role === "assistant"
                                                    ? "Assistant"
                                                    : "You"}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-3 pb-3 pt-0">
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        {/* Render Task Card if this is the assistant message and we have a plan */}
                                        {message.role === 'assistant' && taskPlan && messages[messages.length - 1].id === message.id && (
                                            <div className="mt-4">
                                                <TaskCard title={taskPlan.title} steps={taskPlan.steps} />
                                            </div>
                                        )}
                                         {/* Render Artifact if this is the assistant message and we have one */}
                                         {message.role === 'assistant' && artifact && messages[messages.length - 1].id === message.id && (
                                            <div className="mt-4 border rounded-md p-4 bg-card">
                                                <h4 className="font-medium mb-2">{artifact.title}</h4>
                                                {artifact.type === 'html' && (
                                                    <div dangerouslySetInnerHTML={{ __html: artifact.content }} className="p-2 bg-white rounded text-black" />
                                                )}
                                                {artifact.type === 'markdown' && (
                                                     <pre className="whitespace-pre-wrap text-xs">{artifact.content}</pre>
                                                )}
                                                {/* React rendering would need a dynamic component loader or predefined components */}
                                            </div>
                                        )}
                                        
                                        <p className="text-xs opacity-70 mt-1">
                                            {message.createdAt?.toLocaleTimeString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
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
                            {/* Placeholder history items */}
                            <div className="p-2 rounded-md border cursor-pointer hover:bg-accent text-sm">
                                <div className="font-medium">
                                    Current Conversation
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {messages[0]?.content.substring(0, 30)}...
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
                           {/* Settings content */}
                           <p className="text-xs text-muted-foreground">Settings not implemented yet.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        className="h-10 w-10 p-0"
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
});

MessageThreadPanel.displayName = "MessageThreadPanel";
