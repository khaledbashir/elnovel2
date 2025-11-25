import { query, queryOne } from './database';

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

export interface Document {
    id: string;
    workspace_id: string;
    name: string;
    tambo_thread_id?: string;
    created_at: Date;
    updated_at: Date;
}

export interface DocumentContent {
    document_id: string;
    content_json: any;
    content_markdown?: string;
    updated_at: Date;
}

export interface PricingData {
    document_id: string;
    pricing_json: any;
    discount_percentage: number;
    budget_target?: number;
    budget_notes?: string;
    updated_at: Date;
}

// ============================================
// Workspace Operations
// ============================================

export async function getAllWorkspaces(): Promise<Workspace[]> {
    return await query<Workspace[]>(
        'SELECT * FROM workspaces ORDER BY created_at DESC'
    );
}

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
    return await queryOne<Workspace>(
        'SELECT * FROM workspaces WHERE id = ?',
        [id]
    );
}

export async function createWorkspace(
    id: string,
    name: string,
    description?: string
): Promise<Workspace> {
    await query(
        'INSERT INTO workspaces (id, name, description) VALUES (?, ?, ?)',
        [id, name, description || null]
    );
    return (await getWorkspaceById(id))!;
}

export async function updateWorkspace(
    id: string,
    name?: string,
    description?: string
): Promise<Workspace> {
    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
    }
    if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
    }

    if (updates.length > 0) {
        params.push(id);
        await query(
            `UPDATE workspaces SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
    }

    return (await getWorkspaceById(id))!;
}

export async function deleteWorkspace(id: string): Promise<void> {
    await query('DELETE FROM workspaces WHERE id = ?', [id]);
}

// ============================================
// Document Operations
// ============================================

export async function getDocumentsByWorkspace(workspaceId: string): Promise<Document[]> {
    return await query<Document[]>(
        'SELECT * FROM documents WHERE workspace_id = ? ORDER BY created_at DESC',
        [workspaceId]
    );
}

export async function getDocumentById(id: string): Promise<Document | null> {
    return await queryOne<Document>(
        'SELECT * FROM documents WHERE id = ?',
        [id]
    );
}

export async function createDocument(
    id: string,
    workspaceId: string,
    name: string,
    tamboThreadId?: string
): Promise<Document> {
    await query(
        'INSERT INTO documents (id, workspace_id, name, tambo_thread_id) VALUES (?, ?, ?, ?)',
        [id, workspaceId, name, tamboThreadId || null]
    );

    // Create empty content and pricing data
    await query(
        'INSERT INTO document_content (document_id, content_json) VALUES (?, ?)',
        [id, JSON.stringify({ type: 'doc', content: [] })]
    );

    await query(
        'INSERT INTO pricing_data (document_id, pricing_json) VALUES (?, ?)',
        [id, JSON.stringify({ rows: [], subtotal: 0, discount: 0, gst: 0, total: 0 })]
    );

    return (await getDocumentById(id))!;
}

export async function updateDocument(
    id: string,
    name?: string,
    tamboThreadId?: string
): Promise<Document> {
    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
    }
    if (tamboThreadId !== undefined) {
        updates.push('tambo_thread_id = ?');
        params.push(tamboThreadId);
    }

    if (updates.length > 0) {
        params.push(id);
        await query(
            `UPDATE documents SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
    }

    return (await getDocumentById(id))!;
}

export async function deleteDocument(id: string): Promise<void> {
    await query('DELETE FROM documents WHERE id = ?', [id]);
}

// ============================================
// Document Content Operations
// ============================================

export async function getDocumentContent(documentId: string): Promise<DocumentContent | null> {
    return await queryOne<DocumentContent>(
        'SELECT * FROM document_content WHERE document_id = ?',
        [documentId]
    );
}

export async function updateDocumentContent(
    documentId: string,
    contentJson: any,
    contentMarkdown?: string
): Promise<void> {
    await query(
        'UPDATE document_content SET content_json = ?, content_markdown = ? WHERE document_id = ?',
        [JSON.stringify(contentJson), contentMarkdown || null, documentId]
    );
}

// ============================================
// Pricing Data Operations
// ============================================

export async function getPricingData(documentId: string): Promise<PricingData | null> {
    return await queryOne<PricingData>(
        'SELECT * FROM pricing_data WHERE document_id = ?',
        [documentId]
    );
}

export async function updatePricingData(
    documentId: string,
    pricingJson: any,
    discountPercentage?: number,
    budgetTarget?: number,
    budgetNotes?: string
): Promise<void> {
    await query(
        `UPDATE pricing_data 
     SET pricing_json = ?, 
         discount_percentage = ?, 
         budget_target = ?, 
         budget_notes = ? 
     WHERE document_id = ?`,
        [
            JSON.stringify(pricingJson),
            discountPercentage || 0,
            budgetTarget || null,
            budgetNotes || null,
            documentId,
        ]
    );
}
