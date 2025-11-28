import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema/agents";
import { eq } from "drizzle-orm";

// GET /api/agents/[id] - Get a specific agent
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    try {
        const agent = await db
            .select()
            .from(agents)
            .where(eq(agents.id, params.id))
            .limit(1);

        if (agent.length === 0) {
            return NextResponse.json(
                { error: "Agent not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(agent[0]);
    } catch (error) {
        console.error("Failed to fetch agent:", error);
        return NextResponse.json(
            { error: "Failed to fetch agent" },
            { status: 500 }
        );
    }
}

// PUT /api/agents/[id] - Update an agent
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    try {
        const body = await request.json();
        const { name, description, systemInstructions, isDefault, icon } = body;

        // If this agent is set as default, unset all other defaults
        if (isDefault) {
            await db
                .update(agents)
                .set({ isDefault: false })
                .where(eq(agents.isDefault, true));
        }

        await db
            .update(agents)
            .set({
                name,
                description,
                systemInstructions,
                isDefault,
                icon,
            })
            .where(eq(agents.id, params.id));

        return NextResponse.json({ message: "Agent updated successfully" });
    } catch (error) {
        console.error("Failed to update agent:", error);
        return NextResponse.json(
            { error: "Failed to update agent" },
            { status: 500 }
        );
    }
}

// DELETE /api/agents/[id] - Delete an agent
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    try{
        await db.delete(agents).where(eq(agents.id, params.id));
        return NextResponse.json({ message: "Agent deleted successfully" });
    } catch (error) {
        console.error("Failed to delete agent:", error);
        return NextResponse.json(
            { error: "Failed to delete agent" },
            { status: 500 }
        );
    }
}
