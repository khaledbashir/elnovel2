import { ChromaClient, Collection } from 'chromadb';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

// Initialize Chroma Client
const client = new ChromaClient({
    path: process.env.CHROMA_DB_URL || "http://chroma:8000",
});

// Z.AI Provider for Embeddings
const zai = openai.embedding('text-embedding-3-small', {
    baseURL: process.env.ZAI_API_URL || 'https://api.z.ai/api/coding/paas/v4',
    apiKey: "18f65090a96a425898a8398a5c4518ce.DDtUvTTnUmK020Wx",
});

const COLLECTION_NAME = "knowledge_base";

export async function getCollection(): Promise<Collection> {
    return await client.getOrCreateCollection({
        name: COLLECTION_NAME,
    });
}

export async function saveDocument(
    id: string,
    content: string,
    metadata: Record<string, any>
) {
    const collection = await getCollection();

    // Generate Embedding
    const { embedding } = await embed({
        model: zai,
        value: content,
    });

    // Save to Chroma
    await collection.add({
        ids: [id],
        embeddings: [embedding],
        metadatas: [metadata],
        documents: [content],
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
