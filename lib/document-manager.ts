import { query } from '@/lib/database';
import { Document } from '@/lib/db-operations';

export class DocumentManager {
    /**
     * Search for documents across all workspaces based on a query string.
     * This is a basic implementation using SQL LIKE. For production, 
     * consider full-text search or vector embeddings.
     */
    static async searchDocuments(searchQuery: string): Promise<Document[]> {
        if (!searchQuery || searchQuery.trim().length === 0) {
            return [];
        }

        const searchTerm = `%${searchQuery.trim()}%`;
        
        try {
            const results = await query<Document[]>(
                `SELECT d.*, w.name as workspace_name 
                 FROM documents d
                 JOIN workspaces w ON d.workspace_id = w.id
                 WHERE d.name LIKE ? OR w.name LIKE ?
                 ORDER BY d.updated_at DESC
                 LIMIT 10`,
                [searchTerm, searchTerm]
            );
            return results;
        } catch (error) {
            console.error('[DocumentManager] Search failed:', error);
            return [];
        }
    }

    /**
     * Get document content for RAG context
     */
    static async getDocumentContext(documentId: string): Promise<string | null> {
        try {
            const content = await query<any[]>(
                'SELECT content_markdown, content_json FROM document_content WHERE document_id = ?',
                [documentId]
            );

            if (content && content.length > 0) {
                // Prefer markdown if available, otherwise JSON string
                return content[0].content_markdown || JSON.stringify(content[0].content_json);
            }
            return null;
        } catch (error) {
            console.error('[DocumentManager] Get context failed:', error);
            return null;
        }
    }
}
