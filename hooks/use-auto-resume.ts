import { useEffect, useRef } from "react";
import type { UseChatHelpers } from "ai/react";
import type { ChatMessage } from "@/lib/types";

export function useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
}: {
    autoResume: boolean;
    initialMessages: ChatMessage[];
    resumeStream: UseChatHelpers["resumeStream"];
    setMessages: UseChatHelpers["setMessages"];
}) {
    const hasResumed = useRef(false);

    useEffect(() => {
        if (autoResume && !hasResumed.current && initialMessages.length > 0) {
            const lastMessage = initialMessages[initialMessages.length - 1];
            if (lastMessage.role === "assistant" && lastMessage.content === "") {
                // Resume generation if the last message was empty (interrupted)
                resumeStream();
                hasResumed.current = true;
            }
        }
    }, [autoResume, initialMessages, resumeStream]);
}
