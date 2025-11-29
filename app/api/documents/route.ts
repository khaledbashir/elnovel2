import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT * FROM documents WHERE workspace_id = ? ORDER BY created_at DESC',
      [workspaceId]
    );
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, workspace_id, tambo_thread_id } = await req.json();
    
    if (!title || !workspace_id) {
      return NextResponse.json({ error: 'Title and Workspace ID are required' }, { status: 400 });
    }

    const id = uuidv4();
    // Initialize with empty JSON object for content
    const content = JSON.stringify({});
    
    await pool.query(
      'INSERT INTO documents (id, workspace_id, title, content, tambo_thread_id) VALUES (?, ?, ?, ?, ?)',
      [id, workspace_id, title, content, tambo_thread_id || null]
    );

    return NextResponse.json({ id, title, workspace_id, tambo_thread_id });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
