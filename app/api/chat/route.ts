import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { query } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

// Configure OpenAI provider to use Z.AI
const zai = openai('gpt-4o', {
    baseURL: process.env.ZAI_API_URL || 'https://api.z.ai/api/coding/paas/v4',
    apiKey: process.env.ZAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { messages, id: threadId, system } = await req.json();
        console.log(`[Chat API] Received request for thread ${threadId}`);

        // 1. Ensure thread exists or create it
        try {
            const existingThread = await query('SELECT id FROM threads WHERE id = ?', [threadId]);
            if (!Array.isArray(existingThread) || existingThread.length === 0) {
                console.log(`[Chat API] Creating new thread ${threadId}`);
                await query('INSERT INTO threads (id, title) VALUES (?, ?)', [threadId, messages[0].content.substring(0, 50)]);
            }
        } catch (dbError) {
            console.error('[Chat API] DB Error (Thread):', dbError);
            throw dbError;
        }

        // 2. Save User Message
        try {
            const lastMessage = messages[messages.length - 1];
            await query('INSERT INTO messages (id, thread_id, role, content) VALUES (?, ?, ?, ?)', [
                uuidv4(),
                threadId,
                lastMessage.role,
                lastMessage.content
            ]);
        } catch (dbError) {
            console.error('[Chat API] DB Error (Message):', dbError);
            throw dbError;
        }

        // 3. Stream Response
        console.log('[Chat API] Calling LLM...');
        const result = await streamText({
            model: zai,
            messages: convertToCoreMessages(messages),
            system: system,
            onFinish: async ({ text }) => {
                console.log('[Chat API] LLM Finished. Saving response.');
                try {
                    await query('INSERT INTO messages (id, thread_id, role, content) VALUES (?, ?, ?, ?)', [
                        uuidv4(),
                        threadId,
                        'assistant',
                        text
                    ]);
                } catch (saveError) {
                    console.error('[Chat API] Failed to save assistant message:', saveError);
                }
            },
        });

        return result.toDataStreamResponse();
    } catch (error: any) {
        console.error('[Chat API] Fatal Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
