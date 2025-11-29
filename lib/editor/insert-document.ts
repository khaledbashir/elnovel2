import { Editor } from '@tiptap/react';

/**
 * SOW Data Structure
 */
import { Editor } from '@tiptap/react';

/**
 * Document Data Structure
 */
interface DocumentData {
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
}

/**
 * Utility: Convert unknown value to number
 */
const toNumber = (v: unknown): number => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
        const cleaned = v.replace(/[^0-9.\-]/g, "");
        const n = parseFloat(cleaned);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};

/**
 * Utility: Format currency
 */
const formatCurrency = (n: number): string =>
    new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);

/**
 * Calculate scope total
 */
const calculateScopeTotal = (scope: DocumentData['scopes'][0]): number => {
    if (!scope.roles || scope.roles.length === 0) return 0;
    return scope.roles.reduce((sum, row) => {
        const hours = toNumber(row.hours);
        const rate = toNumber(row.rate);
        return sum + hours * rate;
    }, 0);
};

/**
 * Generate HTML string for entire document
 */
function generateDocumentHTML(docData: DocumentData): string {
    const html: string[] = [];

    // Calculate financial totals
    const subtotal = docData.scopes.reduce((sum, scope) => sum + calculateScopeTotal(scope), 0);
    const discountAmount = subtotal * ((docData.discount || 0) / 100);
    const total = subtotal - discountAmount;

    // Document Title
    html.push(`<h1>${docData.projectTitle}</h1>`);
    html.push(`<p><strong>Client:</strong> ${docData.clientName}</p>`);
    html.push(`<hr />`);

    // Each Scope
    docData.scopes.forEach((scope, scopeIndex) => {
        // Scope heading
        html.push(`<h2>Section ${scopeIndex + 1}: ${scope.title}</h2>`);
        html.push(`<p><em>${scope.description}</em></p>`);

        // Deliverables
        if (scope.deliverables && scope.deliverables.length > 0) {
            html.push(`<h3>Deliverables</h3>`);
            html.push(`<ul>`);
            scope.deliverables.forEach(item => {
                html.push(`<li>${item}</li>`);
            });
            html.push(`</ul>`);
        }

        // Pricing Table
        html.push(`<h3>Pricing</h3>`);

        if (scope.roles && scope.roles.length > 0) {
            html.push(`<table>`);

            // Table header
            html.push(`<thead>`);
            html.push(`<tr>`);
            html.push(`<th>TASK/DESCRIPTION</th>`);
            html.push(`<th>ROLE</th>`);
            html.push(`<th>HOURS</th>`);
            html.push(`<th>RATE</th>`);
            html.push(`<th>TOTAL</th>`);
            html.push(`</tr>`);
            html.push(`</thead>`);

            // Table body
            html.push(`<tbody>`);
            scope.roles.forEach(row => {
                const hours = toNumber(row.hours);
                const rate = toNumber(row.rate);
                const cost = hours * rate;

                html.push(`<tr>`);
                html.push(`<td>${row.task}</td>`);
                html.push(`<td>${row.role}</td>`);
                html.push(`<td>${hours}</td>`);
                html.push(`<td>$${formatCurrency(rate)}</td>`);
                html.push(`<td>$${formatCurrency(cost)}</td>`);
                html.push(`</tr>`);
            });
            html.push(`</tbody>`);
            html.push(`</table>`);

            // Scope total
            const scopeTotal = calculateScopeTotal(scope);
            html.push(`<p><strong>Section Total:</strong> $${formatCurrency(scopeTotal)}</p>`);
        }

        // Assumptions
        if (scope.assumptions && scope.assumptions.length > 0) {
            html.push(`<h3>Assumptions</h3>`);
            html.push(`<ul>`);
            scope.assumptions.forEach(item => {
                html.push(`<li>${item}</li>`);
            });
            html.push(`</ul>`);
        }

        // Separator between scopes
        if (scopeIndex < docData.scopes.length - 1) {
            html.push(`<hr />`);
        }
    });

    // Financial Summary
    html.push(`<hr />`);
    html.push(`<h2>Financial Summary</h2>`);
    html.push(`<p>Subtotal: $${formatCurrency(subtotal)}</p>`);

    if (docData.discount && docData.discount > 0) {
        html.push(`<p>Discount (${docData.discount}%): -$${formatCurrency(discountAmount)}</p>`);
    }

    html.push(`<p><strong>Grand Total:</strong> $${formatCurrency(total)}</p>`);

    // Project Overview
    if (docData.projectOverview) {
        html.push(`<hr />`);
        html.push(`<h2>Project Overview</h2>`);
        html.push(`<p>${docData.projectOverview}</p>`);
    }

    // Budget Notes
    if (docData.budgetNotes) {
        html.push(`<h2>Budget Notes</h2>`);
        html.push(`<p>${docData.budgetNotes}</p>`);
    }

    return html.join('');
}

/**
 * Inserts document data into editor using HTML
 */
export function insertDocumentToEditor(editor: Editor, docData: DocumentData) {
    if (!editor) {
        console.error('Editor not available');
        return;
    }

    try {
        // Generate the complete HTML document
        const htmlContent = generateDocumentHTML(docData);

        console.log('Generated HTML for insertion');

        // Insert the HTML at the end of the document
        editor.chain()
            .focus('end')
            .insertContent(htmlContent)
            .run();

        // Scroll to the newly inserted content
        editor.commands.focus('end');

        console.log('✅ Document content inserted successfully via HTML');
    } catch (error) {
        console.error('❌ Failed to insert document content:', error);
        throw error;
    }
}
