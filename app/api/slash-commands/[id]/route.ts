import { db } from "@/lib/db";
import { slashCommand } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const command = await db
            .select()
            .from(slashCommand)
            .where(eq(slashCommand.id, params.id))
            .limit(1);

        if (command.length === 0) {
            return NextResponse.json(
                { error: "Command not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(command[0]);
    } catch (error) {
        console.error("Error fetching slash command:", error);
        return NextResponse.json(
            { error: "Failed to fetch slash command" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { title, description, icon, searchTerms, prompt, model, provider, isActive } = body;

        // Only allow editing non-system commands
        const existing = await db
            .select()
            .from(slashCommand)
            .where(
                and(
                    eq(slashCommand.id, params.id),
                    eq(slashCommand.isSystem, false)
                )
            )
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json(
                { error: "Command not found or cannot be edited" },
                { status: 404 }
            );
        }

        await db
            .update(slashCommand)
            .set({
                title,
                description,
                icon,
                searchTerms,
                prompt,
                model,
                provider,
                isActive,
                updatedAt: new Date(),
            })
            .where(eq(slashCommand.id, params.id));

        const updated = await db
            .select()
            .from(slashCommand)
            .where(eq(slashCommand.id, params.id))
            .limit(1);

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Error updating slash command:", error);
        return NextResponse.json(
            { error: "Failed to update slash command" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Only allow deleting non-system commands
        const existing = await db
            .select()
            .from(slashCommand)
            .where(
                and(
                    eq(slashCommand.id, params.id),
                    eq(slashCommand.isSystem, false)
                )
            )
            .limit(1);

        if (existing.length === 0) {
            return NextResponse.json(
                { error: "Command not found or cannot be deleted" },
                { status: 404 }
            );
        }

        await db
            .delete(slashCommand)
            .where(eq(slashCommand.id, params.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting slash command:", error);
        return NextResponse.json(
            { error: "Failed to delete slash command" },
            { status: 500 }
        );
    }
}
