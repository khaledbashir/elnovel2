"use client";
import { defaultEditorContent } from "@/lib/content";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";

const hljs = require("highlight.js");

const extensions = [...defaultExtensions, slashCommand];

const TailwindAdvancedEditor = ({ documentId, workspaceId }: { documentId: string | null; workspaceId: string | null }) => {
  const [initialContent, setInitialContent] = useState<JSONContent | null>(defaultEditorContent);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    setCharsCount(editor.storage.characterCount.words());

    // Save to localStorage as fallback
    window.localStorage.setItem("html-content", highlightCodeblocks(editor.getHTML()));
    window.localStorage.setItem("novel-content", JSON.stringify(json));
    try {
      window.localStorage.setItem("markdown", editor.storage.markdown.getMarkdown());
    } catch (error) {
      console.warn("Failed to get markdown, storing plain text", error);
      try {
        window.localStorage.setItem("markdown", String(editor.state.doc?.textContent ?? ""));
      } catch {
        window.localStorage.setItem("markdown", "");
      }
    }

    // Save to database if documentId is available
    if (documentId) {
      try {
        const response = await fetch(`/api/editor-content`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId,
            content: json,
            html: highlightCodeblocks(editor.getHTML()),
          }),
        });

        if (response.ok) {
          setSaveStatus("Saved");
        } else {
          setSaveStatus("Error");
        }
      } catch (error) {
        console.error("Failed to save to database:", error);
        setSaveStatus("Error");
      }
    } else {
      setSaveStatus("Saved");
    }
  }, 500);

  useEffect(() => {
    // Load content from database if documentId is available
    const loadContent = async () => {
      setIsLoading(true);

      if (documentId) {
        try {
          const response = await fetch(`/api/editor-content?documentId=${documentId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.content) {
              setInitialContent(data.content);
              setIsLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error("Failed to load content from database:", error);
        }

        // Fallback to localStorage if database load fails
        const content = window.localStorage.getItem("novel-content");
        if (content) setInitialContent(JSON.parse(content));
      } else {
        // Load from localStorage if no documentId
        const content = window.localStorage.getItem("novel-content");
        if (content) setInitialContent(JSON.parse(content));
      }

      setIsLoading(false);
    };

    loadContent();
  }, [documentId]);

  // Listen for custom event to open AI selector from slash command
  useEffect(() => {
    const handleOpenAI = (event: CustomEvent) => {
      // Defer state changes to a microtask to avoid calling setState during a render/commit
      Promise.resolve().then(() => setOpenAI(true));
      // If there's a specific option and text, we can handle it here
      // The AI selector will handle the actual completion
    };

    window.addEventListener("novel-open-ai", handleOpenAI as EventListener);
    return () => {
      window.removeEventListener("novel-open-ai", handleOpenAI as EventListener);
    };
  }, []);

  // Listen for SOW content insertion event
  useEffect(() => {
    const handleInsertSOW = (event: CustomEvent) => {
      const { scopes, projectTitle, clientName, projectOverview, budgetNotes, totals, discount } = event.detail;

      // Build markdown content
      let markdown = `# ${projectTitle}\n\n`;
      markdown += `**Client:** ${clientName}\n\n`;
      markdown += `---\n\n`;

      // Each scope
      scopes.forEach((scope: any, idx: number) => {
        markdown += `## Scope ${idx + 1}: ${scope.title}\n\n`;
        markdown += `*${scope.description}*\n\n`;

        // Deliverables
        if (scope.deliverables && scope.deliverables.length > 0) {
          markdown += `### Deliverables\n\n`;
          scope.deliverables.forEach((item: string) => {
            markdown += `- ${item}\n`;
          });
          markdown += `\n`;
        }

        // Pricing table
        markdown += `### Pricing\n\n`;
        markdown += `| Task | Role | Hours | Rate (AUD) | Cost (AUD) |\n`;
        markdown += `|------|------|-------|------------|------------|\n`;
        (scope.roles || []).forEach((row: any) => {
          const rate = row.rate || 0;
          const hours = row.hours || 0;
          const cost = (hours * rate * 1.1).toFixed(2);
          markdown += `| ${row.task} | ${row.role} | ${hours} | $${rate.toFixed(2)} | $${cost} |\n`;
        });
        markdown += `\n`;

        const scopeTotal = (scope.roles || []).reduce((sum: number, row: any) => sum + ((row.hours || 0) * (row.rate || 0)), 0);
        const scopeGST = scopeTotal * 0.1;
        const scopeTotalWithGST = scopeTotal + scopeGST;
        markdown += `**Scope Total:** $${scopeTotalWithGST.toFixed(2)} AUD (inc. GST)\n\n`;

        // Assumptions
        if (scope.assumptions && scope.assumptions.length > 0) {
          markdown += `### Assumptions\n\n`;
          scope.assumptions.forEach((item: string) => {
            markdown += `- ${item}\n`;
          });
          markdown += `\n`;
        }

        markdown += `---\n\n`;
      });

      // Financial summary
      markdown += `## Financial Summary\n\n`;
      markdown += `- **Subtotal:** $${totals.subtotal.toFixed(2)} AUD\n`;
      if (discount > 0) {
        markdown += `- **Discount (${discount}%):** -$${totals.discountAmount.toFixed(2)} AUD\n`;
        markdown += `- **After Discount:** $${totals.afterDiscount.toFixed(2)} AUD\n`;
      }
      markdown += `- **GST (10%):** +$${totals.gst.toFixed(2)} AUD\n`;
      markdown += `- **Grand Total:** $${totals.total.toFixed(2)} AUD\n\n`;

      if (projectOverview) {
        markdown += `## Project Overview\n\n${projectOverview}\n\n`;
      }

      if (budgetNotes) {
        markdown += `## Budget Notes\n\n${budgetNotes}\n\n`;
      }

      // Insert into editor by dispatching a paste event
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true,
        cancelable: true
      });

      pasteEvent.clipboardData?.setData('text/plain', markdown);

      // Find the editor element and dispatch the paste event
      const editorElement = document.querySelector('.ProseMirror');
      if (editorElement) {
        editorElement.dispatchEvent(pasteEvent);

        // Show success message
        setTimeout(() => {
          alert('SOW content inserted into editor!');
        }, 100);
      } else {
        console.error('Editor element not found');
        alert('Could not find editor. Please try again.');
      }
    };

    window.addEventListener("insert-sow-content", handleInsertSOW as EventListener);
    return () => {
      window.removeEventListener("insert-sow-content", handleInsertSOW as EventListener);
    };
  }, []);


  if (isLoading) return null;

  return (
    <div className="relative w-full">
      <EditorRoot>
        <div className="sticky top-0 z-20 w-full bg-background border-b px-2 py-1 flex items-center gap-2">
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          <Separator orientation="vertical" />
          <LinkSelector open={openLink} onOpenChange={setOpenLink} />
          <Separator orientation="vertical" />
          <MathSelector />
          <Separator orientation="vertical" />
          <TextButtons />
          <Separator orientation="vertical" />
          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
        </div>
        <EditorContent
          immediatelyRender={false}
          initialContent={initialContent ?? undefined}
          extensions={extensions}
          className="relative w-full border-muted bg-background sm:rounded-lg sm:border sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={item.command ?? (() => { })}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>
          {/* <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
          </GenerativeMenuSwitch> */}
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;
