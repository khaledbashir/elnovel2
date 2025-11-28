"use client";

import { MessageThreadPanelWithAgents } from "@/components/tambo/message-thread-panel-with-agents";

export default function AgentChatDemo() {
    return (
        <div className="h-screen flex flex-col bg-background">
            <div className="flex-shrink-0 p-4 border-b border-border bg-card">
                <h1 className="text-2xl font-bold">Agent Builder Demo</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Select an agent from the dropdown to customize your AI assistant
                </p>
            </div>

            <div className="flex-1 min-h-0">
                <MessageThreadPanelWithAgents
                    contextKey="agent-demo"
                    showAgentSelector={true}
                />
            </div>
        </div>
    );
}
