import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { query } from '@/lib/database';
import { DocumentManager } from '@/lib/document-manager';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Configure OpenAI provider to use Z.AI
const apiKey = process.env.ZAI_API_KEY || "";

if (!apiKey) {
    console.error("CRITICAL: No API Key found");
} else {
    console.log("[Chat API] API Key found with length:", apiKey.length);
}

const zai = createOpenAI({
    baseURL: process.env.ZAI_API_URL || 'https://api.z.ai/api/coding/paas/v4',
    apiKey: apiKey,
});

export async function POST(req: Request) {
    try {
        const { messages, id: threadId, system } = await req.json();
        console.log("[Chat API] Received request for thread", threadId);

        // 1. Ensure thread exists or create it
        try {
            const existingThread = await query('SELECT id FROM threads WHERE id = ?', [threadId]);
            if (!Array.isArray(existingThread) || existingThread.length === 0) {
                console.log("[Chat API] Creating new thread", threadId);
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
            model: zai('GLM-4.6'),
            messages: convertToCoreMessages(messages),
            system: system || `You are an advanced AI Agent.

    WORKFLOW:
1. When a user gives a complex task, FIRST call 'create_plan' to outline the steps.
      2. As you execute, call 'update_step' to show progress.
      3. Finally, call 'render_artifact' to show the result.
      
      Always be transparent about what you are doing.`,
            tools: {
                create_plan: {
                    description: 'Create a visible plan of steps for the task',
                    parameters: z.object({
                        title: z.string(),
                        steps: z.array(z.object({
                            id: z.string(),
                            label: z.string(),
                        }))
                    }),
                    execute: async ({ title, steps }) => {
                        // Server-side acknowledgment
                        return JSON.stringify({ status: 'Plan created', title, stepCount: steps.length });
                    },
                },
                update_step: {
                    description: 'Update the status of a step',
                    parameters: z.object({
                        stepId: z.string(),
                        status: z.enum(['pending', 'running', 'completed', 'failed']),
                        details: z.string().optional(),
                    }),
                    execute: async ({ stepId, status }) => {
                        return JSON.stringify({ status: 'Step updated', stepId, newStatus: status });
                    },
                },
                render_artifact: {
                    description: 'Render the final interactive artifact (HTML/React)',
                    parameters: z.object({
                        title: z.string(),
                        type: z.enum(['html', 'react', 'markdown']),
                        content: z.string(),
                    }),
                    execute: async ({ title }) => {
                        return JSON.stringify({ status: 'Artifact rendered', title });
                    },
                },
                search_documents: {
                    description: 'Search for relevant documents in the knowledge base',
                    parameters: z.object({
                        query: z.string().describe('The search query string'),
                    }),
                    execute: async ({ query }) => {
                        console.log(`[Chat API] Searching documents for: "${query}"`);
                        const docs = await DocumentManager.searchDocuments(query);
                        if (docs.length === 0) {
                            return 'No documents found.';
                        }
                        // For RAG, we might want to fetch content immediately or just return metadata
                        // Returning metadata + snippet for now
                        return JSON.stringify(docs.map(d => ({
                            id: d.id,
                            name: d.name,
                            workspace: (d as any).workspace_name
                        })));
                    },
                },
                get_document_content: {
                    description: 'Get the full content of a specific document',
                    parameters: z.object({
                        documentId: z.string(),
                    }),
                    execute: async ({ documentId }) => {
                        console.log(`[Chat API] Fetching content for document: ${documentId}`);
                        const content = await DocumentManager.getDocumentContext(documentId);
                        return content || 'Document content not found.';
                    }
                }
            },
            onFinish: async ({ text, toolCalls }) => {
                console.log('[Chat API] LLM Finished.');
                // Save assistant message (text + tool calls)
                // Note: For simplicity, we are saving just the text for now, 
                // but a real implementation would save tool calls too.
                try {
                    await query('INSERT INTO messages (id, thread_id, role, content) VALUES (?, ?, ?, ?)', [
                        uuidv4(),
                        threadId,
                        'assistant',
                        text || JSON.stringify(toolCalls) // Fallback if only tool calls
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
