import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema/agents";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/agents - List all agents
export async function GET() {
    try {
        const allAgents = await db.select().from(agents);
        return NextResponse.json(allAgents);
    } catch (error) {
        console.error("Failed to fetch agents:", error);
        return NextResponse.json(
            { error: "Failed to fetch agents" },
            { status: 500 }
        );
    }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, systemInstructions, isDefault, icon } = body;

        if (!name || !systemInstructions) {
            return NextResponse.json(
                { error: "Name and system instructions are required" },
                { status: 400 }
            );
        }

        // If this agent is set as default, unset all other defaults
        if (isDefault) {
            await db
                .update(agents)
                .set({ isDefault: false })
                .where(eq(agents.isDefault, true));
        }

        const newAgent = await db.insert(agents).values({
            id: nanoid(),
            name,
            description: description || null,
            systemInstructions,
            isDefault: isDefault || false,
            icon: icon || "🤖",
        });

        return NextResponse.json(
            { message: "Agent created successfully", id: newAgent.insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error("Failed to create agent:", error);
        return NextResponse.json(
            { error: "Failed to create agent" },
            { status: 500 }
        );
    }
}
