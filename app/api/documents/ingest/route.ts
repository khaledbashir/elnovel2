import { NextRequest, NextResponse } from 'next/server';
import { saveDocument } from '@/lib/vector-db';
import pdf from 'pdf-parse';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        console.log(`[Ingest] Processing file: ${file.name} (${file.size} bytes)`);

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";
        let pageCount = 0;

        // Parse based on file type
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            try {
                const data = await pdf(buffer);
                text = data.text;
                pageCount = data.numpages;
            } catch (e) {
                console.error("[Ingest] PDF Parse Error:", e);
                return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
            }
        } else {
            // Assume text for other types for now (or implement other parsers)
            text = buffer.toString('utf-8');
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: 'No text extracted from document' }, { status: 400 });
        }

        // Generate ID
        const docId = crypto.randomUUID();
        const metadata = {
            id: docId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            pageCount: pageCount,
            wordCount: text.split(/\s+/).length
        };

        // Save to Vector DB
        await saveDocument(docId, text, metadata);

        console.log(`[Ingest] Successfully ingested ${file.name}`);

        return NextResponse.json({
            success: true,
            id: docId,
            text: text.substring(0, 200) + "...", // Preview
            metadata: metadata
        });

    } catch (error: any) {
        console.error('[Ingest] Fatal Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
