import { Command, CommandInput } from "@/components/tailwind/ui/command";

import { useCompletion } from "ai/react";
import { ArrowUp } from "lucide-react";
import { useEditor, getPrevText } from "novel";
import { addAIHighlight } from "novel";
import { useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "../ui/button";
import CrazySpinner from "../ui/icons/crazy-spinner";
import Magic from "../ui/icons/magic";
import { ScrollArea } from "../ui/scroll-area";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";
//TODO: I think it makes more sense to create a custom Tiptap extension for this functionality https://tiptap.dev/docs/editor/ai/introduction

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");

  const { completion, complete, isLoading } = useCompletion({
    // id: "novel",
    api: "/api/generate",
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        return;
      }
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const hasCompletion = completion.length > 0;

  return (
    <Command className="w-[350px] bg-card border-0">
      {hasCompletion && (
        <div className="flex max-h-[400px] border-b border-border">
          <ScrollArea>
            <div className="prose prose-sm dark:prose-invert p-4 max-w-none 
              prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
              prose-p:text-foreground prose-p:my-2 prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4
              prose-ul:my-2 prose-ol:my-2 prose-li:my-1
              prose-table:border-collapse prose-table:w-full 
              prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-medium
              prose-td:border prose-td:border-border prose-td:p-2
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="border-b border-border">
          <details open className="group">
            <summary className="flex h-12 w-full items-center px-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer list-none hover:bg-accent/50 transition-colors">
              <Magic className="mr-2 h-4 w-4 shrink-0 animate-pulse" />
              <span className="flex-1">AI is thinking...</span>
              <div className="ml-2">
                <CrazySpinner />
              </div>
              <svg className="ml-2 h-4 w-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/30 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
                <span className="ml-1">Processing your request</span>
              </div>
            </div>
          </details>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="relative p-2 border-b border-border bg-card">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={hasCompletion ? "Tell AI what to do next" : "Ask AI to edit or generate..."}
              className="pr-10 bg-input border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
              onFocus={() => editor && addAIHighlight(editor)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!editor) return;

                  if (completion) {
                    complete(completion, {
                      body: { option: "zap", command: inputValue },
                    }).then(() => setInputValue(""));
                    return;
                  }

                  // Handle empty selection by getting previous text context
                  const slice = editor.state.selection.content();
                  let text = "";

                  if (slice.content.size > 0) {
                    // Text is selected, use it
                    text = editor.storage.markdown.serializer.serialize(slice.content);
                  } else {
                    // No selection, get previous text for context
                    const pos = editor.state.selection.from;
                    text = getPrevText(editor, {chars: 5000});
                  }

                  complete(text, {
                    body: { option: "zap", command: inputValue },
                  }).then(() => setInputValue(""));
                }
              }}
            />
            <Button
              size="icon"
              className="absolute right-4 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-sm transition-all hover:scale-105"
              onClick={() => {
                if (!editor) return;
                if (completion)
                  return complete(completion, {
                    body: { option: "zap", command: inputValue },
                  }).then(() => setInputValue(""));

                // Handle empty selection by getting previous text context
                const slice = editor.state.selection.content();
                let text = "";

                if (slice.content.size > 0) {
                  // Text is selected, use it
                  text = editor.storage.markdown.serializer.serialize(slice.content);
                } else {
                  // No selection, get previous text for context
                  const pos = editor.state.selection.from;
                  text = getPrevText(editor, {chars: 5000});
                }

                complete(text, {
                  body: { option: "zap", command: inputValue },
                }).then(() => setInputValue(""));
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                if (editor) editor.chain().unsetHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            <AISelectorCommands onSelect={(value, option) => complete(value, { body: { option } })} />
          )}
        </>
      )}
    </Command>
  );
}
