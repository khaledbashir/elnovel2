import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
        return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
    }

    try {
        const messages = await query(
            'SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC',
            [threadId]
        );

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Failed to fetch chat history:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
