import { Editor } from '@tiptap/react';

/**
 * Converts SOW data to Tiptap JSON format and inserts into editor
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

    // Calculate totals
    const calculateScopeTotal = (scope: typeof sowData.scopes[0]) => {
        if (!scope.roles || scope.roles.length === 0) return 0;
        return scope.roles.reduce((sum, row) => sum + (row.hours * row.rate), 0);
    };

    const subtotal = sowData.scopes.reduce((sum, scope) => sum + calculateScopeTotal(scope), 0);
    const discountAmount = subtotal * ((sowData.discount || 0) / 100);
    const afterDiscount = subtotal - discountAmount;
    const gst = afterDiscount * 0.1;
    const total = afterDiscount + gst;

    // Build Tiptap JSON content
    const content: any[] = [];

    // Header
    content.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: sowData.projectTitle }]
    });

    content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: `Client: ${sowData.clientName}` }]
    });

    content.push({
        type: 'horizontalRule'
    });

    // Each Scope
    sowData.scopes.forEach((scope, scopeIndex) => {
        // Scope Header
        content.push({
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: `Scope ${scopeIndex + 1}: ${scope.title}` }]
        });

        // Scope Description
        content.push({
            type: 'paragraph',
            content: [{ type: 'text', text: scope.description, marks: [{ type: 'italic' }] }]
        });

        // Deliverables
        if (scope.deliverables && scope.deliverables.length > 0) {
            content.push({
                type: 'heading',
                attrs: { level: 3 },
                content: [{ type: 'text', text: 'Deliverables' }]
            });

            content.push({
                type: 'bulletList',
                content: scope.deliverables.map(item => ({
                    type: 'listItem',
                    content: [{
                        type: 'paragraph',
                        content: [{ type: 'text', text: item }]
                    }]
                }))
            });
        }

        // Pricing Table
        content.push({
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Pricing' }]
        });

        // Create table rows
        const tableRows = [
            // Header row
            {
                type: 'tableRow',
                content: [
                    { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task' }] }] },
                    { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Role' }] }] },
                    { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hours' }] }] },
                    { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rate (AUD)' }] }] },
                    { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Cost (AUD)' }] }] },
                ]
            },
            // Data rows
            ...scope.roles.map(row => ({
                type: 'tableRow',
                content: [
                    { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: row.task }] }] },
                    { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: row.role }] }] },
                    { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: row.hours.toString() }] }] },
                    { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: `$${row.rate.toFixed(2)}` }] }] },
                    { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: `$${(row.hours * row.rate * 1.1).toFixed(2)}` }] }] },
                ]
            }))
        ];

        content.push({
            type: 'table',
            content: tableRows
        });

        // Scope Total
        const scopeTotal = calculateScopeTotal(scope);
        const scopeGST = scopeTotal * 0.1;
        const scopeTotalWithGST = scopeTotal + scopeGST;

        content.push({
            type: 'paragraph',
            content: [
                { type: 'text', text: 'Scope Total: ', marks: [{ type: 'bold' }] },
                { type: 'text', text: `$${scopeTotalWithGST.toFixed(2)} AUD (inc. GST)` }
            ]
        });

        // Assumptions
        if (scope.assumptions && scope.assumptions.length > 0) {
            content.push({
                type: 'heading',
                attrs: { level: 3 },
                content: [{ type: 'text', text: 'Assumptions' }]
            });

            content.push({
                type: 'bulletList',
                content: scope.assumptions.map(item => ({
                    type: 'listItem',
                    content: [{
                        type: 'paragraph',
                        content: [{ type: 'text', text: item }]
                    }]
                }))
            });
        }

        content.push({
            type: 'horizontalRule'
        });
    });

    // Grand Total Summary
    content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Financial Summary' }]
    });

    const summaryLines = [
        `Subtotal: $${subtotal.toFixed(2)} AUD`,
    ];

    if (sowData.discount && sowData.discount > 0) {
        summaryLines.push(`Discount (${sowData.discount}%): -$${discountAmount.toFixed(2)} AUD`);
        summaryLines.push(`After Discount: $${afterDiscount.toFixed(2)} AUD`);
    }

    summaryLines.push(`GST (10%): +$${gst.toFixed(2)} AUD`);
    summaryLines.push(`**Grand Total: $${total.toFixed(2)} AUD**`);

    summaryLines.forEach(line => {
        const isBold = line.includes('**');
        const text = line.replace(/\*\*/g, '');
        content.push({
            type: 'paragraph',
            content: [{
                type: 'text',
                text,
                marks: isBold ? [{ type: 'bold' }] : []
            }]
        });
    });

    // Project Overview
    if (sowData.projectOverview) {
        content.push({
            type: 'horizontalRule'
        });
        content.push({
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Project Overview' }]
        });
        content.push({
            type: 'paragraph',
            content: [{ type: 'text', text: sowData.projectOverview }]
        });
    }

    // Budget Notes
    if (sowData.budgetNotes) {
        content.push({
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Budget Notes' }]
        });
        content.push({
            type: 'paragraph',
            content: [{ type: 'text', text: sowData.budgetNotes }]
        });
    }

    // Insert into editor
    editor.commands.insertContent(content);

    // Scroll to bottom
    editor.commands.focus('end');
}
