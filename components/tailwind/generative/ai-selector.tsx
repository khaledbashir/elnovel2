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
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose prose-sm dark:prose-invert p-2 px-4 max-w-none prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-td:border prose-td:border-border prose-td:p-2">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <Magic className="mr-2 h-4 w-4 shrink-0  " />
          AI is thinking
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={hasCompletion ? "Tell AI what to do next" : "Ask AI to edit or generate..."}
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
                    text = getPrevText(editor, pos);
                  }

                  complete(text, {
                    body: { option: "zap", command: inputValue },
                  }).then(() => setInputValue(""));
                }
              }}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
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
                  text = getPrevText(editor, pos);
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
