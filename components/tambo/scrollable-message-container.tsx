"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Props for the ScrollableMessageContainer component
 */
export type ScrollableMessageContainerProps = React.HTMLAttributes<HTMLDivElement> & {
    autoScrollTrigger?: any; // Any value that should trigger auto-scroll when changed
};

/**
 * A scrollable container for message content with auto-scroll functionality.
 * Simplified version for use in simple-chat without Tambo dependencies.
 */
export const ScrollableMessageContainer = React.forwardRef<
    HTMLDivElement,
    ScrollableMessageContainerProps
>(({ className, children, autoScrollTrigger, ...props }, ref) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoscroll, setShouldAutoscroll] = useState(true);
    const lastScrollTopRef = useRef(0);

    // Handle forwarded ref
    React.useImperativeHandle(ref, () => scrollContainerRef.current!, []);

    // Handle scroll events to detect user scrolling
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } =
            scrollContainerRef.current;
        const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 8; // 8px tolerance for rounding

        // If user scrolled up, disable autoscroll
        if (scrollTop < lastScrollTopRef.current) {
            setShouldAutoscroll(false);
        }
        // If user is at bottom, enable autoscroll
        else if (isAtBottom) {
            setShouldAutoscroll(true);
        }

        lastScrollTopRef.current = scrollTop;
    };

    // Auto-scroll to bottom when autoScrollTrigger changes
    useEffect(() => {
        if (scrollContainerRef.current && shouldAutoscroll) {
            const scroll = () => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({
                        top: scrollContainerRef.current.scrollHeight,
                        behavior: "smooth",
                    });
                }
            };

            // Use a short delay to batch rapid changes
            const timeoutId = setTimeout(scroll, 50);
            return () => clearTimeout(timeoutId);
        }
    }, [autoScrollTrigger, shouldAutoscroll]);

    return (
        <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className={cn(
                "flex-1 overflow-y-auto",
                "[&::-webkit-scrollbar]:w-[6px]",
                "[&::-webkit-scrollbar-thumb]:bg-gray-300",
                "[&::-webkit-scrollbar:horizontal]:h-[4px]",
                className,
            )}
            data-slot="scrollable-message-container"
            {...props}
        >
            {children}
        </div>
    );
});
ScrollableMessageContainer.displayName = "ScrollableMessageContainer";
