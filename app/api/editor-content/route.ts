import { NextRequest, NextResponse } from 'next/server';
import { getDocumentContent, updateDocumentContent } from '@/lib/db-operations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const contentData = await getDocumentContent(documentId);

    if (!contentData) {
      return NextResponse.json({ content: null });
    }

    return NextResponse.json({ content: contentData.content_json });
  } catch (error) {
    console.error('Error fetching editor content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { documentId, content, markdown } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    await updateDocumentContent(documentId, content, markdown);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving editor content:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}