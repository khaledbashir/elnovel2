import { db } from "@/lib/db";
import { slashCommand } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        // Fetch all active commands (system commands + all custom commands)
        const commands = await db
            .select()
            .from(slashCommand)
            .where(eq(slashCommand.isActive, true));

        return NextResponse.json(commands);
    } catch (error) {
        console.error("Error fetching slash commands:", error);
        return NextResponse.json(
            { error: "Failed to fetch slash commands" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, description, icon, searchTerms, prompt, model, provider } = body;

        if (!title || !prompt) {
            return NextResponse.json(
                { error: "Title and prompt are required" },
                { status: 400 }
            );
        }

        const newCommand = {
            id: crypto.randomUUID(),
            title,
            description: description || null,
            icon: icon || null,
            searchTerms: searchTerms || null,
            prompt,
            model: model || "gpt-4",
            provider: provider || "openai",
            isActive: true,
            isSystem: false,
            userId: null, // No auth for now
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(slashCommand).values(newCommand);

        return NextResponse.json(newCommand, { status: 201 });
    } catch (error) {
        console.error("Error creating slash command:", error);
        return NextResponse.json(
            { error: "Failed to create slash command" },
            { status: 500 }
        );
    }
}
