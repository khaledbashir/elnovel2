import { NextResponse } from 'next/server';

// Serve the rate card as JSON for Tambo context injection
export async function GET() {
    try {
        // Import the rate card data
        const rateCard = await import('@/tambo/sow-workbench/ratecard.json');

        return NextResponse.json({
            rateCard: rateCard.default,
            metadata: {
                totalRoles: rateCard.default.length,
                currency: 'USD', // Base rates are in USD, will display as AUD
                lastUpdated: new Date().toISOString(),
            }
        });
    } catch (error) {
        console.error('Error loading rate card:', error);
        return NextResponse.json(
            { error: 'Failed to load rate card' },
            { status: 500 }
        );
    }
}
