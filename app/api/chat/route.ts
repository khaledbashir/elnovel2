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
    const { messages, id: threadId, system } = await req.json();

    // 1. Ensure thread exists or create it
    const existingThread = await query('SELECT id FROM threads WHERE id = ?', [threadId]);
    if (!Array.isArray(existingThread) || existingThread.length === 0) {
        await query('INSERT INTO threads (id, title) VALUES (?, ?)', [threadId, messages[0].content.substring(0, 50)]);
    }

    // 2. Save User Message
    const lastMessage = messages[messages.length - 1];
    await query('INSERT INTO messages (id, thread_id, role, content) VALUES (?, ?, ?, ?)', [
        uuidv4(),
        threadId,
        lastMessage.role,
        lastMessage.content
    ]);

    // 3. Stream Response
    const result = await streamText({
        model: zai,
        messages: convertToCoreMessages(messages),
        system: system, // Pass system instruction from agent
        onFinish: async ({ text }) => {
            // 4. Save Assistant Message on completion
            await query('INSERT INTO messages (id, thread_id, role, content) VALUES (?, ?, ?, ?)', [
                uuidv4(),
                threadId,
                'assistant',
                text
            ]);
        },
    });

    return result.toDataStreamResponse();
}
