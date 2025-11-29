import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Get distinct thread_ids and their latest message time
        const threads = await query(`
      SELECT 
        thread_id, 
        MAX(created_at) as last_message_at,
        (SELECT content FROM chat_history ch2 WHERE ch2.thread_id = ch1.thread_id ORDER BY created_at ASC LIMIT 1) as first_message
      FROM chat_history ch1
      GROUP BY thread_id
      ORDER BY last_message_at DESC
      LIMIT 50
    `);

        return NextResponse.json({ threads });
    } catch (error) {
        console.error("Failed to fetch threads:", error);
        return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
    }
}
