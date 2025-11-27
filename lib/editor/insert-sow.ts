import { Editor } from '@tiptap/react';

/**
 * Inserts SOW data into editor using TipTap commands to create real table nodes
 */
export function insertSOWToEditor(editor: Editor, sowData: {
    clientName: string;
    projectTitle: string;
    scopes: Array<{
        id: string;
        title: string;
        description: string;
        roles: Array<{
            id: string;
            task: string;
            role: string;
            hours: number;
            rate: number;
        }>;
        deliverables: string[];
        assumptions: string[];
    }>;
    projectOverview?: string;
    budgetNotes?: string;
    discount?: number;
}) {
    if (!editor) {
        console.error('Editor not available');
        return;
    }

    const toNumber = (v: unknown) => {
        if (typeof v === "number" && Number.isFinite(v)) return v;
        if (typeof v === "string") {
            const cleaned = v.replace(/[^0-9.\-]/g, "");
            const n = parseFloat(cleaned);
            return Number.isFinite(n) ? n : 0;
        }
        return 0;
    };

    // Calculate totals
    const calculateScopeTotal = (scope: typeof sowData.scopes[0]) => {
        if (!scope.roles || scope.roles.length === 0) return 0;
        return scope.roles.reduce((sum, row) => {
            const hours = toNumber(row.hours);
            const rate = toNumber(row.rate);
            return sum + hours * rate;
        }, 0);
    };

    const subtotal = sowData.scopes.reduce((sum, scope) => sum + calculateScopeTotal(scope), 0);
    const discountAmount = subtotal * ((sowData.discount || 0) / 100);
    const afterDiscount = subtotal - discountAmount;
    const gst = afterDiscount * 0.1;
    const total = afterDiscount + gst;

    const formatAUD = (n: number) =>
        new Intl.NumberFormat("en-AU", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(n);

    // Start building content using TipTap commands
    // We break the chain into smaller chunks to ensure proper rendering and avoid nested structures
    // editor.state.doc.content.size gives the position at the end of the document
    const endPos = editor.state.doc.content.size;
    editor.chain().insertContentAt(endPos, { type: 'paragraph' }).run();
    
    // Now focus the end, which should be the new paragraph we just added
    editor.commands.focus('end');

    // Title
    editor.chain().focus('end').insertContent({ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: sowData.projectTitle }] }).run();
    editor.chain().focus('end').insertContent({ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Client: ' }, { type: 'text', text: sowData.clientName }] }).run();

    // Each Scope
    sowData.scopes.forEach((scope, scopeIndex) => {
        // Scope heading
        editor.chain().focus('end').insertContent({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Scope ' + (scopeIndex + 1) + ': ' + scope.title }] }).run();
        editor.chain().focus('end').insertContent({ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'italic' }], text: scope.description }] }).run();

        // Deliverables
        if (scope.deliverables && scope.deliverables.length > 0) {
            editor.chain().focus('end').insertContent({ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Deliverables' }] }).run();

            // Create bullet list
            const listItems = scope.deliverables.map(item => ({
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }]
            }));
            editor.chain().focus('end').insertContent({ type: 'bulletList', content: listItems }).run();
            editor.chain().focus('end').insertContent({ type: 'paragraph' }).run(); // Add spacing
        }

        // Pricing Table
        editor.chain().focus('end').insertContent({ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Pricing' }] }).run();

        if (scope.roles && scope.roles.length > 0) {
            // Create table
            const tableRows = [
                // Header row
                {
                    type: 'tableRow',
                    content: [
                        { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'TASK/DESCRIPTION' }] }] },
                        { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ROLE' }] }] },
                        { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'HOURS' }] }] },
                        { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'RATE' }] }] },
                        { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'TOTAL COST + GST' }] }] }
                    ]
                },
                // Data rows
                ...scope.roles.map(row => {
                    const hours = toNumber(row.hours);
                    const rate = toNumber(row.rate);
                    const cost = hours * rate * 1.1;
                    return {
                        type: 'tableRow',
                        content: [
                            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: row.task }] }] },
                            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: row.role }] }] },
                            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: String(hours) }] }] },
                            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: `AUD $${formatAUD(rate)} ` }] }] },
                            { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: `AUD $${formatAUD(cost)} ` }] }] }
                        ]
                    };
                })
            ];

            editor.chain().focus('end').insertContent({ type: 'table', content: tableRows }).run();
            editor.chain().focus('end').insertContent({ type: 'paragraph' }).run(); // Empty paragraph after table

            // Scope total
            const scopeTotal = calculateScopeTotal(scope);
            const scopeGST = scopeTotal * 0.1;
            const scopeTotalWithGST = scopeTotal + scopeGST;
            editor.chain().focus('end').insertContent({ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Scope Total: ' }, { type: 'text', text: `AUD $${formatAUD(scopeTotalWithGST)} (inc. GST)` }] }).run();
        }

        // Assumptions
        if (scope.assumptions && scope.assumptions.length > 0) {
            editor.chain().focus('end').insertContent({ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Assumptions' }] }).run();

            const assumptionItems = scope.assumptions.map(item => ({
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }]
            }));
            editor.chain().focus('end').insertContent({ type: 'bulletList', content: assumptionItems }).run();
            editor.chain().focus('end').insertContent({ type: 'paragraph' }).run(); // Add spacing
        }

        if (scopeIndex < sowData.scopes.length - 1) {
            editor.chain().focus('end').insertContent({ type: 'horizontalRule' }).run();
            editor.chain().focus('end').insertContent({ type: 'paragraph' }).run(); // Empty paragraph after separator
        }
    });

    // Financial Summary
    editor.chain().focus('end').insertContent({ type: 'horizontalRule' }).run();
    editor.chain().focus('end').insertContent({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Financial Summary' }] }).run();
    editor.chain().focus('end').insertContent({ type: 'paragraph', content: [{ type: 'text', text: `Subtotal: AUD $${formatAUD(subtotal)}` }] }).run();

    if (sowData.discount && sowData.discount > 0) {
        editor.chain().focus('end').insertContent({ type: 'paragraph', content: [{ type: 'text', text: `Discount (${sowData.discount}%): AUD -$${formatAUD(discountAmount)}` }] }).run();
        editor.chain().focus('end').insertContent({ type: 'paragraph', content: [{ type: 'text', text: `After Discount: AUD $${formatAUD(afterDiscount)}` }] }).run();
    }

    editor.chain().focus('end').insertContent({ type: 'paragraph', content: [{ type: 'text', text: `GST (10%): AUD +$${formatAUD(gst)}` }] }).run();
    editor.chain().focus('end').insertContent({ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Grand Total: ' }, { type: 'text', text: `AUD $${formatAUD(total)}` }] }).run();

    // Project Overview
    if (sowData.projectOverview) {
        editor.chain().focus('end').insertContent({ type: 'horizontalRule' }).run();
        editor.chain().focus('end').insertContent({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Project Overview' }] }).run();
        editor.chain().focus('end').insertContent({ type: 'paragraph', content: [{ type: 'text', text: sowData.projectOverview }] }).run();
    }

    // Budget Notes
    if (sowData.budgetNotes) {
        editor.chain().focus('end').insertContent({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Budget Notes' }] }).run();
        editor.chain().focus('end').insertContent({ type: 'paragraph', content: [{ type: 'text', text: sowData.budgetNotes }] }).run();
    }

    // Scroll to bottom
    editor.commands.focus('end');
}
