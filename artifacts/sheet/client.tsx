import { TableIcon } from "lucide-react";

export const sheetArtifact = {
    kind: "sheet",
    description: "Spreadsheet",
    icon: TableIcon,
    content: ({ content }: { content: string }) => (
        <div className="p-4">
            <div className="text-muted-foreground">Sheet view not implemented</div>
            <pre className="mt-2 text-xs">{content}</pre>
        </div>
    ),
};
