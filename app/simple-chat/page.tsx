import { SimpleChat } from "@/components/chat/simple-chat";
import { DmsLeftNav } from "@/components/dms/left-nav";
import { ColorStyleGuide } from "@/components/style-guide/colors";
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";

export default function SimpleChatPage() {
  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <div className="flex flex-1 min-h-0 w-full">
        <DmsLeftNav />
        <div className="flex flex-1 h-full overflow-hidden">
          {/* Left pane: Editor (independent scroll) */}
          <div className="flex-1 h-full overflow-y-auto">
            <TailwindAdvancedEditor />
          </div>
          {/* Right pane: Chat (fixed, internal scroll) */}
          <div className="flex h-full w-[380px] min-w-[340px] max-w-[480px] border-l border-border bg-card/50">
            <div className="flex flex-col h-full w-full">
              {/* Message list grows and scrolls */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <SimpleChat className="h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t flex-shrink-0">
        <ColorStyleGuide />
      </div>
    </div>
  );
}