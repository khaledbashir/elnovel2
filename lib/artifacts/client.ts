import type { ReactNode } from "react";

export interface ArtifactMetadata {
    [key: string]: any;
}

export interface ArtifactStreamPart {
    type: string;
    content: any;
}

export interface ArtifactContentProps<TMetadata extends ArtifactMetadata> {
    mode: "view" | "diff";
    status: "idle" | "streaming" | "complete";
    content: string;
    isCurrentVersion: boolean;
    currentVersionIndex: number;
    onSaveContent: (content: string) => void;
    getDocumentContentById: (index: number) => string;
    isLoading: boolean;
    metadata: TMetadata;
    appendMessage: (message: { role: string; content: string }) => void;
}

export interface ArtifactAction {
    icon: ReactNode;
    description: string;
    onClick: (context: { appendMessage: (message: { role: string; content: string }) => void }) => void;
}

export interface ArtifactConfig<TKind extends string, TMetadata extends ArtifactMetadata> {
    kind: TKind;
    description: string;
    initialize?: (context: {
        documentId: string;
        setMetadata: (metadata: TMetadata | ((prev: TMetadata) => TMetadata)) => void;
    }) => Promise<void>;
    onStreamPart?: (context: {
        streamPart: ArtifactStreamPart;
        setMetadata: (metadata: TMetadata | ((prev: TMetadata) => TMetadata)) => void;
        setArtifact: (updater: (draft: { content: string; status: string }) => void) => void;
    }) => void;
    content: (props: ArtifactContentProps<TMetadata>) => ReactNode;
    actions?: ArtifactAction[];
    toolbar?: ArtifactAction[];
}

export class Artifact<TKind extends string, TMetadata extends ArtifactMetadata = ArtifactMetadata> {
    public readonly kind: TKind;
    public readonly description: string;
    public readonly initialize?: ArtifactConfig<TKind, TMetadata>["initialize"];
    public readonly onStreamPart?: ArtifactConfig<TKind, TMetadata>["onStreamPart"];
    public readonly content: ArtifactConfig<TKind, TMetadata>["content"];
    public readonly actions?: ArtifactAction[];
    public readonly toolbar?: ArtifactAction[];

    constructor(config: ArtifactConfig<TKind, TMetadata>) {
        this.kind = config.kind;
        this.description = config.description;
        this.initialize = config.initialize;
        this.onStreamPart = config.onStreamPart;
        this.content = config.content;
        this.actions = config.actions;
        this.toolbar = config.toolbar;
    }
}
