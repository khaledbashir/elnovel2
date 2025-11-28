import { NextResponse } from 'next/server';
import { getAgentById, updateAgent, deleteAgent, setDefaultAgent } from '@/lib/db/agents';

// GET /api/agents/[id] - Get agent by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await getAgentById(params.id);
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error: any) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/agents/[id] - Update agent
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, systemInstructions, icon, isDefault } = await request.json();

    const agent = await updateAgent(
      params.id,
      name,
      systemInstructions,
      description,
      icon,
      isDefault
    );

    return NextResponse.json(agent);
  } catch (error: any) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id] - Delete agent
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteAgent(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/agents/[id]/set-default - Set as default agent
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await setDefaultAgent(params.id);
    return NextResponse.json(agent);
  } catch (error: any) {
    console.error('Error setting default agent:', error);
    return NextResponse.json(
      { error: 'Failed to set default agent', details: error.message },
      { status: 500 }
    );
  }
}
