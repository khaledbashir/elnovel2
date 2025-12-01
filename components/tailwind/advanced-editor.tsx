"use client";
import { defaultEditorContent } from "@/lib/content";
import { Upload, FileUp } from "lucide-react";
import { Button } from "./ui/button";
import {
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandItem,
    EditorCommandList,
    EditorContent,
    type EditorInstance,
    EditorRoot,
    ImageResizer,
    type JSONContent,
    handleCommandNavigation,
    handleImageDrop,
    handleImagePaste,
    EditorBubble,
} from "novel";
import { useEffect, useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";
import { notifications } from "@/lib/utils";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { TableSelector } from "./selectors/table-selector";
import { slashCommand, suggestionItems, SlashCommandDialogs, loadDynamicCommands } from "./slash-command";
import Magic from "./ui/icons/magic";
import { AISelector } from "./generative/ai-selector";
import { removeAIHighlight } from "novel";
import { insertDocumentToEditor } from "@/lib/editor/insert-document";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";

const hljs = require("highlight.js");

const extensions = [...defaultExtensions, slashCommand];

const TailwindAdvancedEditor = ({
    documentId,
    workspaceId,
}: {
    documentId: string | null;
    workspaceId: string | null;
}) => {
    const [initialContent, setInitialContent] = useState<JSONContent | null>(
        defaultEditorContent,
    );
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [charsCount, setCharsCount] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const editorRef = useRef<EditorInstance | null>(null);

    const [openNode, setOpenNode] = useState(false);
    const [openColor, setOpenColor] = useState(false);
    const [openLink, setOpenLink] = useState(false);
    const [openAI, setOpenAI] = useState(false);
    const [isSelectionEmpty, setIsSelectionEmpty] = useState(true);

    // CopilotKit: Expose editor content for context
    useCopilotReadable({
        description: "The content of the editor in plain text",
        value: editorRef.current?.getText() || "",
    });

    // CopilotKit: Expose available editor capabilities
    useCopilotReadable({
        description: "Available editor extensions and capabilities",
        value: `
The editor supports these features that you can use:
- **Tables**: Insert tables, add/delete rows and columns, merge cells, toggle headers
- **Text Formatting**: Bold, italic, underline, strikethrough, code, highlight colors
- **Headings**: H1, H2, H3 levels
- **Lists**: Bullet lists, numbered lists, task/checkbox lists
- **Links**: Insert and edit hyperlinks
- **Images**: Insert images (via URL or upload)
- **Code Blocks**: Syntax-highlighted code in multiple languages
- **Math**: LaTeX/KaTeX mathematical equations
- **Embeds**: YouTube videos, Twitter/X posts
- **Alignment**: Left, center, right text alignment
- **Blockquotes**: Quote blocks with left border
- **Horizontal Rules**: Divider lines
- **Colors**: Text color and background highlight colors

When the user asks you to perform editor actions, use the appropriate action.
For chat/discussion without editing, just respond normally without calling actions.
        `.trim(),
    });

    // CopilotKit Action: Append content (non-destructive)
    useCopilotAction({
        name: "appendContent",
        description: "Append content to the end of the editor. Use this when user wants to ADD content without replacing existing content.",
        parameters: [
            {
                name: "content",
                type: "string",
                description: "The content to append (can be markdown or plain text)",
                required: true,
            },
        ],
        handler: async ({ content }) => {
            if (editorRef.current) {
                editorRef.current.chain().focus("end").insertContent(content).run();
            }
        },
    });

    // CopilotKit Action: Replace all content
    useCopilotAction({
        name: "setContent",
        description: "Replace ALL editor content. Use this only when user explicitly wants to REPLACE everything.",
        parameters: [
            {
                name: "content",
                type: "string",
                description: "Full content to replace in the editor",
                required: true,
            },
        ],
        handler: async ({ content }) => {
            if (editorRef.current) {
                editorRef.current.commands.setContent(content);
            }
        },
    });

    // CopilotKit Action: Insert table
    useCopilotAction({
        name: "insertTable",
        description: "Insert a table at the current cursor position",
        parameters: [
            {
                name: "rows",
                type: "number",
                description: "Number of rows (default 3)",
                required: false,
            },
            {
                name: "cols",
                type: "number", 
                description: "Number of columns (default 3)",
                required: false,
            },
            {
                name: "withHeaderRow",
                type: "boolean",
                description: "Include a header row (default true)",
                required: false,
            },
        ],
        handler: async ({ rows = 3, cols = 3, withHeaderRow = true }) => {
            if (editorRef.current) {
                editorRef.current.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
            }
        },
    });

    // CopilotKit Action: Insert heading
    useCopilotAction({
        name: "insertHeading",
        description: "Insert a heading at the current position",
        parameters: [
            {
                name: "level",
                type: "number",
                description: "Heading level: 1, 2, or 3",
                required: true,
            },
            {
                name: "text",
                type: "string",
                description: "The heading text",
                required: true,
            },
        ],
        handler: async ({ level, text }) => {
            if (editorRef.current) {
                editorRef.current.chain()
                    .focus()
                    .insertContent(`<h${level}>${text}</h${level}>`)
                    .run();
            }
        },
    });

    // CopilotKit Action: Insert list
    useCopilotAction({
        name: "insertList",
        description: "Insert a list (bullet, numbered, or task list)",
        parameters: [
            {
                name: "type",
                type: "string",
                description: "List type: 'bullet', 'numbered', or 'task'",
                required: true,
            },
            {
                name: "items",
                type: "string",
                description: "List items separated by newlines",
                required: true,
            },
        ],
        handler: async ({ type, items }) => {
            if (editorRef.current) {
                const itemsArray = items.split('\n').filter(Boolean);
                let html = '';
                
                if (type === 'bullet') {
                    html = `<ul>${itemsArray.map(item => `<li>${item}</li>`).join('')}</ul>`;
                } else if (type === 'numbered') {
                    html = `<ol>${itemsArray.map(item => `<li>${item}</li>`).join('')}</ol>`;
                } else if (type === 'task') {
                    html = `<ul data-type="taskList">${itemsArray.map(item => `<li data-type="taskItem" data-checked="false">${item}</li>`).join('')}</ul>`;
                }
                
                editorRef.current.chain().focus().insertContent(html).run();
            }
        },
    });

    // CopilotKit Action: Format selected text
    useCopilotAction({
        name: "formatText",
        description: "Apply formatting to selected text or toggle formatting at cursor",
        parameters: [
            {
                name: "format",
                type: "string",
                description: "Format type: 'bold', 'italic', 'underline', 'strike', 'code', 'highlight'",
                required: true,
            },
            {
                name: "color",
                type: "string",
                description: "For highlight format, the color (e.g., 'yellow', 'green', 'blue', 'red')",
                required: false,
            },
        ],
        handler: async ({ format, color }) => {
            if (editorRef.current) {
                const chain = editorRef.current.chain().focus();
                switch (format) {
                    case 'bold': chain.toggleBold().run(); break;
                    case 'italic': chain.toggleItalic().run(); break;
                    case 'underline': chain.toggleUnderline().run(); break;
                    case 'strike': chain.toggleStrike().run(); break;
                    case 'code': chain.toggleCode().run(); break;
                    case 'highlight': 
                        if (color) {
                            chain.toggleHighlight({ color }).run();
                        } else {
                            chain.toggleHighlight().run();
                        }
                        break;
                }
            }
        },
    });

    // CopilotKit Action: Insert code block
    useCopilotAction({
        name: "insertCodeBlock",
        description: "Insert a code block with syntax highlighting",
        parameters: [
            {
                name: "language",
                type: "string",
                description: "Programming language (e.g., 'javascript', 'python', 'typescript', 'html', 'css')",
                required: true,
            },
            {
                name: "code",
                type: "string",
                description: "The code content",
                required: true,
            },
        ],
        handler: async ({ language, code }) => {
            if (editorRef.current) {
                editorRef.current.chain()
                    .focus()
                    .setCodeBlock({ language })
                    .insertContent(code)
                    .run();
            }
        },
    });

    // CopilotKit Action: Insert link
    useCopilotAction({
        name: "insertLink",
        description: "Insert a hyperlink",
        parameters: [
            {
                name: "text",
                type: "string",
                description: "The link text to display",
                required: true,
            },
            {
                name: "url",
                type: "string",
                description: "The URL to link to",
                required: true,
            },
        ],
        handler: async ({ text, url }) => {
            if (editorRef.current) {
                editorRef.current.chain()
                    .focus()
                    .insertContent(`<a href="${url}">${text}</a>`)
                    .run();
            }
        },
    });

    // CopilotKit Action: Insert blockquote
    useCopilotAction({
        name: "insertBlockquote",
        description: "Insert a blockquote",
        parameters: [
            {
                name: "text",
                type: "string",
                description: "The quote text",
                required: true,
            },
        ],
        handler: async ({ text }) => {
            if (editorRef.current) {
                editorRef.current.chain()
                    .focus()
                    .insertContent(`<blockquote>${text}</blockquote>`)
                    .run();
            }
        },
    });

    // CopilotKit Action: Insert horizontal rule
    useCopilotAction({
        name: "insertDivider",
        description: "Insert a horizontal divider/rule",
        parameters: [],
        handler: async () => {
            if (editorRef.current) {
                editorRef.current.chain().focus().setHorizontalRule().run();
            }
        },
    });

    // CopilotKit Action: Set text alignment
    useCopilotAction({
        name: "setAlignment",
        description: "Set text alignment for current paragraph or selection",
        parameters: [
            {
                name: "alignment",
                type: "string",
                description: "Alignment: 'left', 'center', or 'right'",
                required: true,
            },
        ],
        handler: async ({ alignment }) => {
            if (editorRef.current) {
                editorRef.current.chain().focus().setTextAlign(alignment).run();
            }
        },
    });

    // CopilotKit Action: Clear all content
    useCopilotAction({
        name: "clearContent",
        description: "Clear all content from the editor. Use only when user explicitly asks to clear/delete everything.",
        parameters: [],
        handler: async () => {
            if (editorRef.current) {
                editorRef.current.commands.clearContent();
            }
        },
    });

    // Force blur editor when clicking outside to close slash menu
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // If click is outside the editor container and not in a portal (like dialogs/menus)
            if (
                editorRef.current &&
                !editorRef.current.view.dom.contains(target) &&
                !target.closest('[role="dialog"]') &&
                !target.closest('[role="listbox"]') &&
                !target.closest('[cmdk-root]')
            ) {
                editorRef.current.commands.blur();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);

    //Apply Codeblock Highlighting on the HTML from editor.getHTML()
    const highlightCodeblocks = (content: string) => {
        const doc = new DOMParser().parseFromString(content, "text/html");
        doc.querySelectorAll("pre code").forEach((el) => {
            // @ts-ignore
            // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
            hljs.highlightElement(el);
        });
        return new XMLSerializer().serializeToString(doc);
    };

    const debouncedUpdates = useDebouncedCallback(
        async (editor: EditorInstance) => {
            const json = editor.getJSON();
            setCharsCount(editor.storage.characterCount.words());

            // Save to localStorage as fallback
            window.localStorage.setItem(
                "html-content",
                highlightCodeblocks(editor.getHTML()),
            );
            window.localStorage.setItem("novel-content", JSON.stringify(json));
            try {
                window.localStorage.setItem(
                    "markdown",
                    editor.storage.markdown.getMarkdown(),
                );
            } catch (error) {
                console.warn(
                    "Failed to get markdown, storing plain text",
                    error,
                );
                try {
                    window.localStorage.setItem(
                        "markdown",
                        String(editor.state.doc?.textContent ?? ""),
                    );
                } catch {
                    window.localStorage.setItem("markdown", "");
                }
            }

            // Save to database if documentId is available
            if (documentId) {
                try {
                    const response = await fetch(`/api/editor-content`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            documentId,
                            content: json,
                            html: highlightCodeblocks(editor.getHTML()),
                        }),
                    });

                    if (response.ok) {
                        setSaveStatus("Saved");
                    } else {
                        setSaveStatus("Error");
                    }
                } catch (error) {
                    console.error("Failed to save to database:", error);
                    setSaveStatus("Error");
                }
            } else {
                setSaveStatus("Saved");
            }
        },
        500,
    );

    const [editorItems, setEditorItems] = useState(suggestionItems);

    useEffect(() => {
        // Load content from database if documentId is available
        const loadContent = async () => {
            setIsLoading(true);

            if (documentId) {
                try {
                    const response = await fetch(
                        `/api/editor-content?documentId=${documentId}`,
                    );
                    if (response.ok) {
                        const data = await response.json();
                        if (data.content) {
                            setInitialContent(data.content);
                            setIsLoading(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.error(
                        "Failed to load content from database:",
                        error,
                    );
                }

                // Fallback to localStorage if database load fails
                const content = window.localStorage.getItem("novel-content");
                if (content) setInitialContent(JSON.parse(content));
            } else {
                // Load from localStorage if no documentId
                const content = window.localStorage.getItem("novel-content");
                if (content) setInitialContent(JSON.parse(content));
            }

            setIsLoading(false);
        };

        loadContent();
        // Load dynamic slash commands from database
        loadDynamicCommands().then((items) => {
            if (items) setEditorItems(items);
        });
    }, [documentId]);

    // Listen for custom event to open AI selector from slash command
    useEffect(() => {
        const handleOpenAI = (event: CustomEvent) => {
            // Defer state changes to a microtask to avoid calling setState during a render/commit
            Promise.resolve().then(() => setOpenAI(true));
            // If there's a specific option and text, we can handle it here
            // The AI selector will handle the actual completion
        };

        window.addEventListener("novel-open-ai", handleOpenAI as EventListener);
        return () => {
            window.removeEventListener(
                "novel-open-ai",
                handleOpenAI as EventListener,
            );
        };
    }, []);

    // Listen for document content insertion event
    useEffect(() => {
        const handleInsertDocument = (event: CustomEvent) => {
            const {
                scopes,
                projectTitle,
                clientName,
                projectOverview,
                budgetNotes,
                discount,
            } = event.detail;

            try {
                // Transform the data to match the expected format
                const docData = {
                    clientName,
                    projectTitle,
                    scopes: scopes.map((scope: any, idx: number) => ({
                        id: `scope-${idx}`,
                        title: scope.title,
                        description: scope.description,
                        roles: (scope.roles || []).map(
                            (row: any, rowIdx: number) => ({
                                id: `role-${idx}-${rowIdx}`,
                                task: row.task,
                                role: row.role,
                                hours: row.hours || 0,
                                rate: row.rate || 0,
                            }),
                        ),
                        deliverables: scope.deliverables || [],
                        assumptions: scope.assumptions || [],
                    })),
                    projectOverview,
                    budgetNotes,
                    discount,
                };

                console.log("Inserting document data:", docData);

                // Check if editor is available
                if (editorRef.current) {
                    insertDocumentToEditor(editorRef.current, docData);
                } else {
                    console.error(
                        "Editor not available - waiting for initialization",
                    );
                    notifications.warning(
                        "Editor loading...",
                        "Waiting for editor to initialize before inserting content.",
                    );

                    // Wait a moment and try again
                    setTimeout(() => {
                        if (editorRef.current) {
                            // Retry the insert operation
                            insertDocumentToEditor(editorRef.current, docData);
                        } else {
                            console.error(
                                "Editor still not available after timeout",
                            );
                            notifications.error(
                                "Editor initialization failed",
                                "Editor is taking too long to initialize. Please refresh the page and try again.",
                            );
                        }
                    }, 2000);
                }
            } catch (error) {
                console.error("Error preparing document content:", error);
                notifications.error(
                    "Failed to prepare document content",
                    error instanceof Error ? error.message : String(error),
                );
            }
        };

        const handleExportPDF = async () => {
            if (!editorRef.current) {
                notifications.error(
                    "Editor not ready",
                    "Please wait for the editor to fully load.",
                );
                return;
            }

            try {
                // Dynamically import html2pdf to avoid SSR issues
                const html2pdf = (await import("html2pdf.js")).default;

                // Target the live editor element directly
                const element = editorRef.current.view.dom;

                // Configure PDF options with onclone callback for style overrides
                type Html2PdfOptions = {
                    margin: [number, number, number, number];
                    filename: string;
                    image: { type: "jpeg" | "png" | "webp"; quality: number };
                    html2canvas: {
                        scale: number;
                        useCORS: boolean;
                        logging: boolean;
                        backgroundColor: string;
                        onclone: (clonedDoc: Document) => void;
                    };
                    jsPDF: {
                        unit: "mm";
                        format: "a4" | "letter" | "legal" | "tabloid";
                        orientation: "portrait" | "landscape";
                    };
                };

                const opt: Html2PdfOptions = {
                    margin: [10, 10, 20, 10], // Top, Left, Bottom, Right (mm)
                    filename: "Document_Export.pdf",
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: "#ffffff", // Force white background
                        onclone: (clonedDoc: Document) => {
                            // Find the editor element in the cloned virtual DOM
                            const editorElement = clonedDoc.querySelector('.ProseMirror') as HTMLElement;

                            if (editorElement) {
                                // Force light mode styling on the cloned editor
                                editorElement.style.backgroundColor = 'white';
                                editorElement.style.color = 'black';

                                // Force all child elements to have black text and light borders
                                const allElements = editorElement.querySelectorAll('*');
                                allElements.forEach((el) => {
                                    const htmlEl = el as HTMLElement;
                                    htmlEl.style.color = 'black';
                                    htmlEl.style.borderColor = '#e5e7eb'; // Light gray borders

                                    // Force table cells to white background
                                    if (htmlEl.tagName === 'TD' || htmlEl.tagName === 'TH') {
                                        htmlEl.style.backgroundColor = 'white';
                                    }

                                    // Force table backgrounds
                                    if (htmlEl.tagName === 'TABLE') {
                                        htmlEl.style.backgroundColor = 'white';
                                    }
                                });
                            }

                            // CRITICAL: Force input values to appear in PDF
                            // html2canvas sometimes ignores input values, so we explicitly set them
                            const inputs = clonedDoc.querySelectorAll('input');
                            inputs.forEach((input) => {
                                const htmlInput = input as HTMLInputElement;
                                // Force the value to appear as text for the PDF
                                htmlInput.style.color = 'black';
                                htmlInput.style.backgroundColor = 'white';
                                // HTML2Canvas quirk: sometimes needs value explicitly set as attribute
                                htmlInput.setAttribute('value', htmlInput.value || '');
                            });

                            // Also handle select/dropdown values
                            const selects = clonedDoc.querySelectorAll('select');
                            selects.forEach((select) => {
                                const htmlSelect = select as HTMLSelectElement;
                                htmlSelect.style.color = 'black';
                                htmlSelect.style.backgroundColor = 'white';
                            });
                        }
                    },
                    jsPDF: {
                        unit: "mm",
                        format: "a4",
                        orientation: "portrait",
                    },
                };

                // Generate PDF from the live element (html2canvas will clone internally)
                const worker = html2pdf().set(opt).from(element);

                // Generate PDF with custom modifications
                await worker
                    .toPdf()
                    .get("pdf")
                    .then((pdf: any) => {
                        // Add Green Footer Bar to every page
                        const totalPages = pdf.internal.getNumberOfPages();
                        for (let i = 1; i <= totalPages; i++) {
                            pdf.setPage(i);
                            pdf.setFillColor(0, 208, 132); // #00D084
                            pdf.rect(0, 287, 210, 10, "F"); // Green bar at bottom

                            // Optional: Add legal text
                            if (i === totalPages) {
                                pdf.setFontSize(9);
                                pdf.setTextColor(100, 100, 100);
                                pdf.text(
                                    "*** This concludes the Scope of Work document. ***",
                                    105,
                                    283,
                                    { align: "center" },
                                );
                            }
                        }
                    })
                    .then(() => {
                        // Save the PDF after modifications
                        worker.save();
                    });

            } catch (error) {
                console.error("PDF Export failed:", error);
                notifications.error(
                    "PDF export failed",
                    "Failed to export PDF. Please try again.",
                );
            }
        };

        window.addEventListener(
            "insert-document-content",
            handleInsertDocument as EventListener,
        );
        window.addEventListener(
            "export-editor-pdf",
            handleExportPDF as EventListener,
        );

        return () => {
            window.removeEventListener(
                "insert-document-content",
                handleInsertDocument as EventListener,
            );
            window.removeEventListener(
                "export-editor-pdf",
                handleExportPDF as EventListener,
            );
        };
    }, []);

    useEffect(() => {
        if (!openAI && editorRef.current) removeAIHighlight(editorRef.current);
    }, [openAI, editorRef.current]);

    // Show loading spinner while content is being fetched
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Editor will render even if editorRef.current is null initially
    // It will be set when the EditorContent component calls onCreate

    return (
        <div className="relative w-full h-full flex overflow-hidden">
            <SlashCommandDialogs />

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <EditorRoot>
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto [scrollbar-gutter:stable] p-4">
                        <div className="w-full min-w-0 max-w-[900px] xl:max-w-[1200px] mx-auto bg-card p-6 md:p-12 rounded-lg border border-border shadow-sm">
                            <EditorContent
                                immediatelyRender={false}
                                initialContent={initialContent ?? undefined}
                                extensions={extensions}
                                className="w-full min-h-[500px] break-words"
                                onCreate={({ editor }) => {
                                    editorRef.current = editor;
                                    editor.on("selectionUpdate", () => {
                                        setIsSelectionEmpty(editor.state.selection.empty);
                                    });
                                    console.log("Editor initialized successfully");
                                }}
                                onDestroy={() => {
                                    editorRef.current = null;
                                }}
                                editorProps={{
                                    handleDOMEvents: {
                                        keydown: (_view, event) =>
                                            handleCommandNavigation(event),
                                    },
                                    handlePaste: (view, event) =>
                                        handleImagePaste(view, event, uploadFn),
                                    handleDrop: (view, event, _slice, moved) =>
                                        handleImageDrop(
                                            view,
                                            event,
                                            moved,
                                            uploadFn,
                                        ),
                                    attributes: {
                                        class: `prose prose-sm dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full break-words prose-a:text-primary hover:prose-a:text-primary/80 prose-blockquote:border-primary prose-strong:text-foreground prose-headings:text-foreground prose-p:text-foreground dark:prose-p:text-foreground prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1 prose-ul:my-2 prose-ol:my-2 prose-li:my-0`,
                                        style: 'min-height: 500px; overflow-anchor: auto;',
                                    },
                                    transformPastedHTML: (html) => html,
                                }}
                                onUpdate={({ editor }) => {
                                    debouncedUpdates(editor);
                                    setSaveStatus("Unsaved");
                                }}
                                slotAfter={<ImageResizer />}
                            >
                                <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
                                    <EditorCommandEmpty className="px-2 text-muted-foreground">
                                        No results
                                    </EditorCommandEmpty>
                                    <EditorCommandList>
                                        {editorItems.map((item) => (
                                            <EditorCommandItem
                                                value={item.title}
                                                onCommand={() => {
                                                    if (
                                                        item.command &&
                                                        editorRef.current
                                                    ) {
                                                        item.command({
                                                            editor: editorRef.current,
                                                            range: {
                                                                from: editorRef
                                                                    .current.state
                                                                    .selection.from,
                                                                to: editorRef
                                                                    .current.state
                                                                    .selection.to,
                                                            },
                                                        });
                                                    }
                                                }}
                                                className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
                                                key={item.title}
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </EditorCommandItem>
                                        ))}
                                    </EditorCommandList>
                                </EditorCommand>
                                <EditorBubble
                                    tippyOptions={{
                                        placement: "top",
                                        zIndex: 100,
                                        onHidden: () => {
                                            setOpenAI(false);
                                            editorRef.current
                                                ?.chain()
                                                .unsetHighlight()
                                                .run();
                                        },
                                    }}
                                    className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl z-[100]"
                                >
                                    {openAI ? (
                                        <AISelector
                                            open={openAI}
                                            onOpenChange={setOpenAI}
                                        />
                                    ) : (
                                        <>
                                            <Separator orientation="vertical" />
                                            <NodeSelector
                                                open={openNode}
                                                onOpenChange={setOpenNode}
                                            />
                                            <Separator orientation="vertical" />
                                            <LinkSelector
                                                open={openLink}
                                                onOpenChange={setOpenLink}
                                            />
                                            <Separator orientation="vertical" />
                                            <TextButtons />
                                            <Separator orientation="vertical" />
                                            <TableSelector />
                                            <Separator orientation="vertical" />
                                            <ColorSelector
                                                open={openColor}
                                                onOpenChange={setOpenColor}
                                            />
                                            <Separator orientation="vertical" />
                                            <button
                                                onClick={() => setOpenAI(true)}
                                                className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-emerald-600 hover:bg-accent hover:text-emerald-700 transition-colors"
                                            >
                                                <Magic className="h-4 w-4" />
                                                Ask AI
                                            </button>
                                        </>
                                    )}
                                </EditorBubble>
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
                                {openAI && isSelectionEmpty && (
                                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 z-[100] flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl">
                                        <AISelector open={openAI} onOpenChange={setOpenAI} />
                                    </div>
                                )}
                            </EditorContent>
                        </div>
                    </div>
                </EditorRoot>
            </div>


        </div>
    );
};

export default TailwindAdvancedEditor;
