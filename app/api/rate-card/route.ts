import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Serve the rate card as JSON for Tambo context injection
export async function GET() {
    try {
        // Read the rate card file directly from the file system
        const filePath = path.join(
            process.cwd(),
            "tambo/sow-workbench/ratecard.json",
        );
        const fileContents = await readFile(filePath, "utf8");
        const rateCard = JSON.parse(fileContents);

        return NextResponse.json({
            rateCard,
            metadata: {
                totalRoles: rateCard.length,
                currency: "USD", // Base rates are in USD, will display as AUD
                lastUpdated: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("Error loading rate card:", error);
        return NextResponse.json(
            { error: "Failed to load rate card" },
            { status: 500 },
        );
    }
}
