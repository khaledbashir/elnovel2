import { ChromaClient, Collection } from 'chromadb';
import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';
import { v4 as uuidv4 } from 'uuid';

// Initialize Chroma Client
const client = new ChromaClient({
    path: process.env.CHROMA_DB_URL || "http://chroma:8000",
});

import { createOpenAI } from '@ai-sdk/openai';

// Z.AI Provider Configuration
const zaiProvider = createOpenAI({
    baseURL: process.env.ZAI_API_URL || 'https://api.z.ai/api/coding/paas/v4',
    apiKey: process.env.ZAI_API_KEY,
});

const zai = zaiProvider.embedding('text-embedding-3-small');

const COLLECTION_NAME = "knowledge_base";

export async function getCollection(): Promise<Collection> {
    return await client.getOrCreateCollection({
        name: COLLECTION_NAME,
    });
}

function chunkText(text: string, maxLength: number = 1000): string[] {
    const chunks: string[] = [];
    let currentChunk = "";
    const sentences = text.split(/(?<=[.?!])\s+/);

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength) {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = sentence;
        } else {
            currentChunk += (currentChunk ? " " : "") + sentence;
        }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
}

export async function saveDocument(
    id: string,
    content: string,
    metadata: Record<string, any>
) {
    const collection = await getCollection();
    const chunks = chunkText(content);

    // Generate Embeddings for all chunks
    const { embeddings } = await embedMany({
        model: zai,
        values: chunks,
    });

    // Prepare data for Chroma
    const ids = chunks.map((_, i) => `${id}-${i}`);
    const metadatas = chunks.map(() => metadata);
    const documents = chunks;

    // Save to Chroma
    await collection.add({
        ids,
        embeddings,
        metadatas,
        documents,
    });
}

export async function searchSimilar(query: string, limit: number = 5) {
    const collection = await getCollection();

    // Generate Query Embedding
    const { embedding } = await embed({
        model: zai,
        value: query,
    });

    // Search
    const results = await collection.query({
        queryEmbeddings: [embedding],
        nResults: limit,
    });

    // Format results
    const formatted = [];
    if (results.ids.length > 0) {
        for (let i = 0; i < results.ids[0].length; i++) {
            formatted.push({
                id: results.ids[0][i],
                content: results.documents[0][i],
                metadata: results.metadatas[0][i],
                score: results.distances ? results.distances[0][i] : 0,
            });
        }
    }

    return formatted;
}

