import { MessageThreadPanel } from "@/components/ui/message-thread-panel";

export default function MessageThreadDemo() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">MessageThreadPanel Demo</h1>
        
        {/* Basic Usage Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <div className="flex h-screen max-h-[600px] border rounded-lg overflow-hidden">
            {/* Main content area */}
            <div className="flex-1 p-6 bg-muted/20">
              <h3 className="text-xl font-medium mb-4">Dashboard</h3>
              <p className="text-muted-foreground mb-4">
                Your main content goes here. This demonstrates how the MessageThreadPanel
                works as a sidebar component alongside your primary content.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-card rounded-lg border">
                  <h4 className="font-medium mb-2">Sample Content Block</h4>
                  <p className="text-sm text-muted-foreground">
                    This is where your main application content would be displayed.
                    The chat panel on the right provides a persistent AI assistant
                    interface without disrupting the main workflow.
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <h4 className="font-medium mb-2">Another Content Block</h4>
                  <p className="text-sm text-muted-foreground">
                    Notice how the chat panel maintains its own scroll state
                    and conversation history independently of the main content.
                  </p>
                </div>
              </div>
            </div>

            {/* Chat panel on the right */}
            <MessageThreadPanel
              contextKey="dashboard-assistant"
              className="right"
              style={{ width: "400px" }}
            />
          </div>
        </section>

        {/* Left Panel Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Left Panel Configuration</h2>
          <div className="flex h-screen max-h-[500px] border rounded-lg overflow-hidden">
            {/* Chat panel on the left */}
            <MessageThreadPanel
              contextKey="left-assistant"
              className="left"
              style={{ width: "350px" }}
            />

            {/* Main content area */}
            <div className="flex-1 p-6 bg-muted/20">
              <h3 className="text-xl font-medium mb-4">Content Area</h3>
              <p className="text-muted-foreground">
                This example shows the MessageThreadPanel positioned on the left side.
                The panel adapts its styling based on the className prop.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Panel Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Footer Panel Configuration</h2>
          <div className="border rounded-lg overflow-hidden">
            {/* Main content area */}
            <div className="p-6 bg-muted/20 min-h-[300px]">
              <h3 className="text-xl font-medium mb-4">Main Content</h3>
              <p className="text-muted-foreground mb-4">
                This layout shows the MessageThreadPanel as a footer component,
                perfect for chat interfaces that need to span the full width.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-lg border">
                  <h4 className="font-medium mb-2">Feature 1</h4>
                  <p className="text-sm text-muted-foreground">Content here</p>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <h4 className="font-medium mb-2">Feature 2</h4>
                  <p className="text-sm text-muted-foreground">Content here</p>
                </div>
              </div>
            </div>

            {/* Chat panel as footer */}
            <MessageThreadPanel
              contextKey="footer-assistant"
              className="footer"
              style={{ height: "300px" }}
            />
          </div>
        </section>

        {/* API Documentation */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Component API</h2>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">MessageThreadPanel Props</h3>
            <div className="space-y-3">
              <div className="flex gap-4">
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono min-w-[120px]">contextKey</code>
                <span className="text-sm text-muted-foreground">string - Unique identifier for the conversation thread</span>
              </div>
              <div className="flex gap-4">
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono min-w-[120px]">className</code>
                <span className="text-sm text-muted-foreground">string - Additional CSS classes, typically includes position (left/right/footer)</span>
              </div>
              <div className="flex gap-4">
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono min-w-[120px]">style</code>
                <span className="text-sm text-muted-foreground">CSSProperties - Inline styles for customizing width, height, etc.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}