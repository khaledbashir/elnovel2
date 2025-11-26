import { ArrowDownWideNarrow, CheckCheck, RefreshCcwDot, StepForward, WrapText } from "lucide-react";
import { getPrevText, useEditor } from "novel";
import { CommandGroup, CommandItem, CommandSeparator } from "../ui/command";

const options = [
  {
    value: "improve",
    label: "Improve writing",
    icon: RefreshCcwDot,
  },
  {
    value: "fix",
    label: "Fix grammar",
    icon: CheckCheck,
  },
  {
    value: "shorter",
    label: "Make shorter",
    icon: ArrowDownWideNarrow,
  },
  {
    value: "longer",
    label: "Make longer",
    icon: WrapText,
  },
];

interface AISelectorCommandsProps {
  onSelect: (value: string, option: string) => void;
}

const AISelectorCommands = ({ onSelect }: AISelectorCommandsProps) => {
  const { editor } = useEditor();

  return (
    <>
      <CommandGroup heading="Edit or review selection">
        {options.map((option) => (
          <CommandItem
            onSelect={(value) => {
              if (!editor) return;

              // Get the current selection
              const { from, to } = editor.state.selection;
              const slice = editor.state.selection.content();

              // Try to get text from selection
              let text = "";

              if (slice.content.size > 0) {
                // Use markdown serializer if available
                try {
                  text = editor.storage.markdown.serializer.serialize(slice.content);
                } catch (e) {
                  // Fallback to plain text
                  text = editor.state.doc.textBetween(from, to, " ");
                }
              }

              // If we have text, use it; otherwise show a message
              if (text && text.trim()) {
                console.log(`AI ${value} with text:`, text);
                onSelect(text, value);
              } else {
                console.warn("No text selected for AI command");
                // You could show a toast here
              }
            }}
            className="flex gap-2 px-4"
            key={option.value}
            value={option.value}
          >
            <option.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Use AI to do more">
        <CommandItem
          onSelect={() => {
            if (!editor) return;
            const pos = editor.state.selection.from;
            const text = getPrevText(editor, pos);
            onSelect(text, "continue");
          }}
          value="continue"
          className="gap-2 px-4"
        >
          <StepForward className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Continue writing
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AISelectorCommands;
