import { NextRequest, NextResponse } from 'next/server';
import { getProviderConfig } from '@/lib/ai/provider-config';

export const runtime = 'edge';
export const revalidate = 300; // Cache for 5 minutes

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const provider = searchParams.get('provider');

        if (!provider) {
            return NextResponse.json(
                { error: 'Provider parameter is required' },
                { status: 400 }
            );
        }

        const config = getProviderConfig(provider);

        if (!config) {
            return NextResponse.json(
                { error: `Unknown provider: ${provider}` },
                { status: 400 }
            );
        }

        if (!config.apiKey) {
            return NextResponse.json(
                { error: `API key not configured for provider: ${provider}` },
                { status: 500 }
            );
        }

        const modelsURL = `${config.baseURL}${config.modelsEndpoint || '/models'}`;

        const response = await fetch(modelsURL, {
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch models from ${provider}:`, response.statusText);
            return NextResponse.json(
                { error: `Failed to fetch models from ${provider}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Normalize the response - most providers return { data: [...] }
        const models = data.data || data.models || data;

        return NextResponse.json({ models });
    } catch (error: any) {
        console.error('Error fetching models:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
