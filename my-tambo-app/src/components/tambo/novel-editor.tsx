"use client";

import { Editor } from "novel";
import { useState, useEffect, useRef } from "react";
import { withInteractable } from "@tambo-ai/react";
import { z } from "zod";
import { cn } from "@/lib/utils";

/**
 * Zod schema for the Novel Editor
 * This defines the properties that Tambo AI can read and modify.
 */
export const novelEditorSchema = z.object({
  title: z.string().describe("The title of the novel or document"),
  content: z.string().describe("The JSON or Markdown content of the document"),
  editable: z.boolean().optional().describe("Whether the editor is read-only or editable"),
  className: z.string().optional().describe("Optional CSS class names"),
});

export type NovelEditorProps = z.infer<typeof novelEditorSchema>;

/**
 * Base Novel Editor Component
 * Wraps the 'novel' editor with local state management to handle
 * external updates from Tambo while maintaining internal editor state.
 */
function NovelEditorBase({
  title,
  content,
  editable = true,
  className,
}: NovelEditorProps) {
  // We use a key to force re-render when content changes externally significantly,
  // but for a real editor, we might want more granular control.
  // For this MVP, we'll rely on the editor's ability to handle initial content.
  
  // Local state to track the content if needed for other purposes
  const [currentContent, setCurrentContent] = useState(content);

  // Effect to update local state if props change (e.g. AI updates content)
  useEffect(() => {
    setCurrentContent(content);
  }, [content]);

  return (
    <div className={cn("relative w-full max-w-screen-lg", className)}>
      <div className="mb-4">
        <input
          type="text"
          value={title}
          readOnly={!editable}
          className="w-full text-4xl font-bold border-none focus:ring-0 bg-transparent placeholder:text-gray-400"
          placeholder="Untitled"
        />
      </div>
      <div className="relative min-h-[500px] w-full border rounded-lg shadow-sm bg-background">
         <Editor
           defaultValue={JSON.parse(content || "{}")} 
           disableLocalStorage={true}
           className="min-h-[500px]"
           // Additional configuration for the novel editor would go here
           // For now, we use default configuration
         />
      </div>
    </div>
  );
}

/**
 * Interactable Novel Editor
 * The component wrapped with 'withInteractable' to enable AI control.
 */
export const InteractableNovelEditor = withInteractable(NovelEditorBase, {
  componentName: "NovelEditor",
  description: "A rich text editor for writing novels, stories, or documents. Supports title and content updates.",
  propsSchema: novelEditorSchema,
});

// Default export for easier importing
export default InteractableNovelEditor;
