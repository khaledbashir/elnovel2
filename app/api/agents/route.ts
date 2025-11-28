import { NextResponse } from 'next/server';
import { getAllAgents, createAgent } from '@/lib/db/agents';
import { v4 as uuidv4 } from 'uuid';

// GET /api/agents - List all agents
export async function GET() {
  try {
    const agents = await getAllAgents();
    return NextResponse.json(agents);
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/agents - Create new agent
export async function POST(request: Request) {
  try {
    const { name, description, systemInstructions, icon, isDefault } = await request.json();

    if (!name || !systemInstructions) {
      return NextResponse.json(
        { error: 'Name and system instructions are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const agent = await createAgent(
      id,
      name,
      systemInstructions,
      description,
      icon || '🤖',
      isDefault || false
    );

    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent', details: error.message },
      { status: 500 }
    );
  }
}
