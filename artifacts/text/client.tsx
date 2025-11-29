import { FileTextIcon } from "lucide-react";

export const textArtifact = {
    kind: "text",
    description: "Text document",
    icon: FileTextIcon,
    content: ({ content }: { content: string }) => (
        <div className="prose dark:prose-invert max-w-none p-4 whitespace-pre-wrap">
            {content}
        </div>
    ),
};
