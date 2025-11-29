import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
    try {
        const threads = await query('SELECT * FROM threads ORDER BY updated_at DESC');
        return NextResponse.json({ threads });
    } catch (error) {
        console.error("Failed to fetch threads:", error);
        return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { id, title } = await req.json();
        await query('INSERT INTO threads (id, title) VALUES (?, ?)', [id, title]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to create thread:", error);
        return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
    }
}
