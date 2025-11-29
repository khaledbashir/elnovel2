import { CodeIcon } from "lucide-react";

export const codeArtifact = {
    kind: "code",
    description: "Code snippet",
    icon: CodeIcon,
    content: ({ content }: { content: string }) => (
        <pre className="p-4 overflow-x-auto bg-muted rounded-md">
            <code>{content}</code>
        </pre>
    ),
};
