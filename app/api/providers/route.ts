import { NextResponse } from 'next/server';
import { getAvailableProviders } from '@/lib/ai/provider-config';

export const runtime = 'edge';

export async function GET() {
    try {
        const providers = getAvailableProviders();
        return NextResponse.json({ providers });
    } catch (error: any) {
        console.error('Error fetching providers:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
