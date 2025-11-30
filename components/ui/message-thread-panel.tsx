"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface MessageThreadPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Add any specific props here
}

export function MessageThreadPanel({
  className,
  ...props
}: MessageThreadPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden border-l bg-background",
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Thread</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {/* Placeholder content */}
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Select a message to view its thread.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
