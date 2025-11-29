import {
    CheckSquare,
    Code,
    Heading1,
    Heading2,
    Heading3,
    ImageIcon,
    List,
    ListOrdered,
    MessageSquarePlus,
    Text,
    TextQuote,
    Twitter,
    Youtube,
    ArrowDownWideNarrow,
    CheckCheck,
    RefreshCcwDot,
    StepForward,
    WrapText,
    Table as TableIcon,
} from "lucide-react";
import { Command, createSuggestionItems, renderItems } from "novel";
import { uploadFn } from "./image-upload";
import Magic from "./ui/icons/magic";
import { notifications } from "@/lib/utils";
import { InputDialog } from "./ui/input-dialog";
import { useState } from "react";

// State management for dialogs
let setYoutubeDialogOpen: ((open: boolean) => void) | null = null;
let setTwitterDialogOpen: ((open: boolean) => void) | null = null;
let setGenerateImageDialogOpen: ((open: boolean) => void) | null = null;
let setPresentationDialogOpen: ((open: boolean) => void) | null = null;
let currentEditor: any = null;
let currentRange: any = null;

export function SlashCommandDialogs() {
    const [youtubeOpen, setYoutubeOpen] = useState(false);
    const [twitterOpen, setTwitterOpen] = useState(false);
    const [generateImageOpen, setGenerateImageOpen] = useState(false);
    const [presentationOpen, setPresentationOpen] = useState(false);

    // Expose setters globally
    setYoutubeDialogOpen = setYoutubeOpen;
    setTwitterDialogOpen = setTwitterOpen;
    setGenerateImageDialogOpen = setGenerateImageOpen;
    setPresentationDialogOpen = setPresentationOpen;

    // Toggle body class when any dialog is open to hide slash menu
    useEffect(() => {
        const isAnyDialogOpen = youtubeOpen || twitterOpen || generateImageOpen || presentationOpen;
        if (isAnyDialogOpen) {
            document.body.classList.add("slash-command-dialog-open");
        } else {
            document.body.classList.remove("slash-command-dialog-open");
        }
        return () => {
            document.body.classList.remove("slash-command-dialog-open");
        };
    }, [youtubeOpen, twitterOpen, generateImageOpen, presentationOpen]);

    return (
        <>
            <InputDialog
                open={generateImageOpen}
                onOpenChange={setGenerateImageOpen}
                title="Generate Image (AI)"
                description="Describe the image you want to generate."
                placeholder="A futuristic city at sunset..."
                onSubmit={(prompt) => {
                    if (prompt && prompt.length > 0) {
                        const imageUrl = `/api/generate-image?prompt=${encodeURIComponent(prompt)}`;
                        currentEditor
                            ?.chain()
                            .focus()
                            .deleteRange(currentRange)
                            .setImage({
                                src: imageUrl,
                                alt: prompt,
                                title: prompt
                            })
                            .run();
                    } else {
                        notifications.error(
                            "Invalid prompt",
                            "Please enter a description for the image."
                        );
                    }
                }}
            />
            <InputDialog
                open={youtubeOpen}
                onOpenChange={setYoutubeOpen}
                title="Embed YouTube Video"
                description="Enter a YouTube video URL"
                placeholder="https://www.youtube.com/watch?v=..."
                onSubmit={(videoLink) => {
                    const ytregex = new RegExp(
                        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)?([\w\-]+)(\S+)?$/,
                    );

                    if (videoLink && ytregex.test(videoLink)) {
                        currentEditor
                            ?.chain()
                            .focus()
                            .deleteRange(currentRange)
                            .setYoutubeVideo({
                                src: videoLink,
                            })
                            .run();
                    } else {
                        notifications.error(
                            "Invalid YouTube link",
                            "Please enter a correct YouTube video link.",
                        );
                    }
                }}
            />
            <InputDialog
                open={twitterOpen}
                onOpenChange={setTwitterOpen}
                title="Embed Tweet"
                description="Enter a Twitter/X post URL"
                placeholder="https://x.com/username/status/..."
                onSubmit={(tweetLink) => {
                    const tweetRegex = new RegExp(
                        /^https?:\/\/(www\.)?(x\.com|twitter\.com)\/([a-zA-Z0-9_]{1,15})(\/status\/(\d+))?(\/\S*)?$/,
                    );

                    if (tweetLink && tweetRegex.test(tweetLink)) {
                        currentEditor
                            ?.chain()
                            .focus()
                            .deleteRange(currentRange)
                            .setTweet({
                                src: tweetLink,
                            })
                            .run();
                    } else {
                        notifications.error(
                            "Invalid Twitter link",
                            "Please enter a correct Twitter/X link.",
                        );
                    }
                }}
            />
            <InputDialog
                open={presentationOpen}
                onOpenChange={setPresentationOpen}
                title="Generate Presentation"
                description="Describe the presentation topic and requirements."
                placeholder="Help an AI startup team create a big model market analysis PPT"
                onSubmit={async (prompt) => {
                    if (prompt && prompt.length > 0) {
                        try {
                            // Show loading notification
                            notifications.info(
                                "Generating presentation...",
                                "This may take a moment. The PDF will download automatically."
                            );

                            const response = await fetch("/api/generate-slides", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ prompt }),
                            });

                            if (response.ok) {
                                const data = await response.json();

                                // Assuming the API returns a URL or blob to the PDF
                                // We'll need to handle the actual download/display
                                if (data.url) {
                                    window.open(data.url, "_blank");
                                } else if (data.pdf) {
                                    // Handle base64 PDF or other format
                                    const blob = new Blob([Buffer.from(data.pdf, 'base64')], { type: 'application/pdf' });
                                    const url = URL.createObjectURL(blob);
                                    window.open(url, "_blank");
                                }

                                notifications.success(
                                    "Presentation generated!",
                                    "Your presentation PDF is ready."
                                );
                            } else {
                                const error = await response.json();
                                notifications.error(
                                    "Generation failed",
                                    error.error || "Failed to generate presentation."
                                );
                            }
                        } catch (error) {
                            console.error("Error generating presentation:", error);
                            notifications.error(
                                "Error",
                                "Failed to generate presentation. Please try again."
                            );
                        }
                    } else {
                        notifications.error(
                            "Invalid prompt",
                            "Please enter a description for the presentation."
                        );
                    }
                }}
            />
        </>
    );
}

const dispatchOpenAI = (detail: Record<string, any>) =>
    Promise.resolve().then(() =>
        window.dispatchEvent(new CustomEvent("novel-open-ai", { detail })),
    );

// Static formatting commands (non-AI)
const staticFormattingCommands = [
    {
        title: "Text",
        description: "Just start typing with plain text.",
        searchTerms: ["p", "paragraph"],
        icon: <Text size={18} />,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleNode("paragraph", "paragraph")
                .run();
        },
    },
    {
        title: "To-do List",
        description: "Track tasks with a to-do list.",
        searchTerms: ["todo", "task", "list", "check", "checkbox"],
        icon: <CheckSquare size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },
    {
        title: "Heading 1",
        description: "Big section heading.",
        searchTerms: ["title", "big", "large"],
        icon: <Heading1 size={18} />,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 1 })
                .run();
        },
    },
    {
        title: "Heading 2",
        description: "Medium section heading.",
        searchTerms: ["subtitle", "medium"],
        icon: <Heading2 size={18} />,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 2 })
                .run();
        },
    },
    {
        title: "Heading 3",
        description: "Small section heading.",
        searchTerms: ["subtitle", "small"],
        icon: <Heading3 size={18} />,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 3 })
                .run();
        },
    },
    {
        title: "Bullet List",
        description: "Create a simple bullet list.",
        searchTerms: ["unordered", "point"],
        icon: <List size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: "Numbered List",
        description: "Create a list with numbering.",
        searchTerms: ["ordered"],
        icon: <ListOrdered size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        title: "Quote",
        description: "Capture a quote.",
        searchTerms: ["blockquote"],
        icon: <TextQuote size={18} />,
        command: ({ editor, range }) =>
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleNode("paragraph", "paragraph")
                .toggleBlockquote()
                .run(),
    },
    {
        title: "Code",
        description: "Capture a code snippet.",
        searchTerms: ["codeblock"],
        icon: <Code size={18} />,
        command: ({ editor, range }) =>
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
        title: "Table",
        description: "Insert a table.",
        searchTerms: ["table", "grid", "spreadsheet"],
        icon: <TableIcon size={18} />,
        command: ({ editor, range }) => {
            try {
                editor.chain().focus().deleteRange(range).run();
                const result = editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run();

                if (!result) {
                    notifications.error(
                        "Table insertion failed",
                        "Check console for more details.",
                    );
                }
            } catch (error) {
                console.error("Error inserting table:", error);
                notifications.error(
                    "Error inserting table",
                    error instanceof Error ? error.message : String(error),
                );
            }
        },
    },
    {
        title: "Generate Presentation",
        description: "AI will generate professional slides/poster in PDF format.",
        searchTerms: ["presentation", "slides", "ppt", "poster", "deck"],
        icon: <span className="text-[18px]">📊</span>,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            // Blur editor to close slash menu
            setTimeout(() => {
                editor.commands.blur();
                setPresentationDialogOpen?.(true);
            }, 100);
        },
    },
    {
        title: "Generate Image (AI)",
        description: "Generate an image using AI.",
        searchTerms: ["image", "generate", "ai", "picture", "photo"],
        icon: <Magic size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            currentEditor = editor;
            currentRange = range;
            setTimeout(() => {
                editor.commands.blur();
                setGenerateImageDialogOpen?.(true);
            }, 100);
        },
    },
    {
        title: "Image",
        description: "Upload an image from your computer.",
        searchTerms: ["photo", "picture", "media"],
        icon: <ImageIcon size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
                if (input.files?.length) {
                    const file = input.files[0];
                    const pos = editor.view.state.selection.from;
                    uploadFn(file, editor.view, pos);
                }
            };
            input.click();
        },
    },
    {
        title: "Youtube",
        description: "Embed a Youtube video.",
        searchTerms: ["video", "youtube", "embed"],
        icon: <Youtube size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            currentEditor = editor;
            currentRange = range;
            setTimeout(() => {
                editor.commands.blur();
                setYoutubeDialogOpen?.(true);
            }, 100);
        },
    },
    {
        title: "Twitter",
        description: "Embed a Tweet.",
        searchTerms: ["twitter", "embed"],
        icon: <Twitter size={18} />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            currentEditor = editor;
            currentRange = range;
            setTimeout(() => {
                editor.commands.blur();
                setTwitterDialogOpen?.(true);
            }, 100);
        },
    },
];

// Icon mapping for string icon names to components
const iconMap: Record<string, any> = {
    "StepForward": StepForward,
    "RefreshCcwDot": RefreshCcwDot,
    "CheckCheck": CheckCheck,
    "ArrowDownWideNarrow": ArrowDownWideNarrow,
    "WrapText": WrapText,
};

// Fetch dynamic AI commands from the database
let dynamicAICommands: any[] = [];

export const loadDynamicCommands = async () => {
    try {
        const response = await fetch("/api/slash-commands");
        if (response.ok) {
            const commands = await response.json();
            dynamicAICommands = commands
                .filter((cmd: any) => cmd.isActive)
                .map((cmd: any) => {
                    // Parse icon: if it starts with a letter, it's a lucide icon name, else it's an emoji
                    let icon = <Magic className="h-[18px] w-[18px] text-emerald-600" />;
                    if (cmd.icon) {
                        if (iconMap[cmd.icon]) {
                            const IconComponent = iconMap[cmd.icon];
                            icon = <IconComponent size={18} className="text-emerald-600" />;
                        } else {
                            // Treat as emoji or text
                            icon = <span className="text-[18px]">{cmd.icon}</span>;
                        }
                    }

                    return {
                        title: cmd.title,
                        description: cmd.description || "",
                        searchTerms: cmd.searchTerms ? cmd.searchTerms.split(",").map((t: string) => t.trim()) : [],
                        icon,
                        command: ({ editor, range }: any) => {
                            editor.chain().focus().deleteRange(range).run();
                            dispatchOpenAI({ option: "custom", prompt: cmd.prompt, model: cmd.model, provider: cmd.provider });
                        },
                    };
                });
        }
    } catch (error) {
        console.error("Failed to load dynamic slash commands:", error);
    }
};

// Combine static and dynamic commands
export const getSuggestionItems = () => {
    // Add "Ask AI" as the first AI command
    const askAICommand = {
        title: "Ask AI",
        description: "Use AI to generate or edit content.",
        searchTerms: ["ai", "generate", "ask", "magic"],
        icon: <Magic className="h-[18px] w-[18px] text-emerald-600" />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).run();
            dispatchOpenAI({ option: "continue" });
        },
    };

    return createSuggestionItems([
        askAICommand,
        ...dynamicAICommands,
        ...staticFormattingCommands,
    ]);
};

export const suggestionItems = getSuggestionItems();

export const slashCommand = Command.configure({
    suggestion: {
        items: () => getSuggestionItems(),
        render: renderItems,
    },
});

