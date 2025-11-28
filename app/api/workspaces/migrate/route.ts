import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
    try {
        // Add description column to workspaces if it doesn't exist
        try {
            await query(`ALTER TABLE workspaces ADD COLUMN description TEXT`);
            return NextResponse.json({ success: true, message: 'Added description column to workspaces' });
        } catch (error: any) {
            // Ignore if column already exists (error code 1060)
            if (error.code === 'ER_DUP_FIELDNAME') {
                return NextResponse.json({ success: true, message: 'Column description already exists' });
            }
            throw error;
        }
    } catch (error: any) {
        console.error('Migration failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
