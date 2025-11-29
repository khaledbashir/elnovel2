import { useEffect, useRef, useState } from "react";
import type { UseChatHelpers } from "ai/react";
import type { ChatMessage } from "@/lib/types";

export function useMessages({
    status,
}: {
    status: UseChatHelpers["status"];
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const [hasSentMessage, setHasSentMessage] = useState(false);

    const onViewportEnter = () => {
        // Logic to handle viewport enter if needed
    };

    const onViewportLeave = () => {
        // Logic to handle viewport leave if needed
    };

    useEffect(() => {
        if (status === "streaming") {
            setHasSentMessage(true);
            endRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [status]);

    return {
        containerRef,
        endRef,
        onViewportEnter,
        onViewportLeave,
        hasSentMessage,
    };
}
