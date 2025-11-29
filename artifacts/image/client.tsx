import { ImageIcon } from "lucide-react";

export const imageArtifact = {
    kind: "image",
    description: "Image file",
    icon: ImageIcon,
    content: ({ content }: { content: string }) => (
        <div className="flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content} alt="Artifact" className="max-w-full h-auto rounded-md" />
        </div>
    ),
};
