"use client";

import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { MessageThreadPanel } from "@/components/tambo/message-thread-panel";

export default function Page() {
  return (
    <div className="h-screen overflow-hidden bg-background flex">
      <div className="flex-1 h-full min-h-0 overflow-y-auto py-0 sm:px-5">
        <TailwindAdvancedEditor />
      </div>

      <MessageThreadPanel contextKey="editor-assistant" className="right" />
    </div>
  );
}
