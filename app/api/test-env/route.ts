import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    tamboProjectId: process.env.NEXT_PUBLIC_TAMBO_PROJECT_ID || 'NOT SET',
    tamboApiKeySet: process.env.NEXT_PUBLIC_TAMBO_API_KEY ? 'YES' : 'NO',
    tamboUrl: process.env.NEXT_PUBLIC_TAMBO_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  });
}
