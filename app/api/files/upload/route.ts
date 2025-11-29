import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public/uploads (ensure directory exists)
        // For now, we'll just simulate a URL since we might not want to persist files permanently on disk without cleanup
        // But for RAG, we usually process them. 
        // Let's return a fake URL that the frontend can use to display the attachment

        // In a real app, you'd upload to S3/Blob or save to disk and serve via static route
        const filename = file.name;
        const contentType = file.type;

        // For this demo/template, we'll just return success
        return NextResponse.json({
            url: `https://example.com/uploads/${filename}`, // Fake URL
            pathname: filename,
            contentType: contentType,
        });

    } catch (error) {
        console.error('Upload failed:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
