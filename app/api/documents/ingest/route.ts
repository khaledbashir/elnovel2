import { NextResponse } from 'next/server';
import { saveDocument } from '@/lib/vector-db';
import { v4 as uuidv4 } from 'uuid';

// Polyfill DOMMatrix for pdf-parse/pdf.js in Node environment
if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() {
            this.a = 1; this.b = 0; this.c = 0; this.d = 1;
            this.e = 0; this.f = 0;
        }
        translate() { return this; }
        scale() { return this; }
        rotate() { return this; }
        multiply() { return this; }
        inverse() { return this; }
    };
}

// Force Node.js runtime for pdf-parse
export const runtime = 'nodejs';

// Simple Recursive Character Text Splitter
function splitText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        let endIndex = startIndex + chunkSize;

        // If we are not at the end, try to find a break point (newline or space)
        if (endIndex < text.length) {
            const nextNewLine = text.lastIndexOf('\n', endIndex);
            const nextSpace = text.lastIndexOf(' ', endIndex);

            if (nextNewLine > startIndex) {
                endIndex = nextNewLine;
            } else if (nextSpace > startIndex) {
                endIndex = nextSpace;
            }
        }

        chunks.push(text.slice(startIndex, endIndex).trim());
        startIndex = endIndex - overlap; // Move back for overlap
        if (startIndex < 0) startIndex = 0; // Safety

        // Avoid infinite loops if chunk size is too small for a single word
        if (endIndex <= startIndex + overlap) {
            startIndex = endIndex;
        }
    }

    return chunks;
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        // Parse based on file type
        if (file.type === 'application/pdf') {
            // Dynamically import pdf-parse to avoid build-time issues
            const pdfParse = (await import('pdf-parse')).default;
            const data = await pdfParse(buffer);
            text = data.text;
        } else {
            text = buffer.toString('utf-8');
        }

        // Split text
        const chunks = splitText(text);

        // Save chunks to Vector DB
        const docId = uuidv4();
        const promises = chunks.map((chunk, index) => {
            return saveDocument(
                `${docId}-${index}`,
                chunk,
                {
                    source: file.name,
                    page: index + 1, // Rough approximation
                    docId: docId,
                    timestamp: Date.now()
                }
            );
        });

        await Promise.all(promises);

        return NextResponse.json({
            success: true,
            chunks: chunks.length,
            message: `Successfully indexed ${file.name}`
        });

    } catch (error: any) {
        console.error('Ingestion failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
