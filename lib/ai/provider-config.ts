export type ProviderConfig = {
    name: string;
    baseURL: string;
    apiKey: string | undefined;
    modelsEndpoint?: string;
};

export const providerConfigs: Record<string, ProviderConfig> = {
    openai: {
        name: 'OpenAI',
        baseURL: 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
        modelsEndpoint: '/models',
    },
    openrouter: {
        name: 'OpenRouter',
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPEN_ROUTER_API_KEY,
        modelsEndpoint: '/models',
    },
    zai: {
        name: 'Z.AI',
        baseURL: 'https://api.z.ai/api/paas/v4',
        apiKey: process.env.ZAI_API_KEY,
        modelsEndpoint: '/models',
    },
    gemini: {
        name: 'Google Gemini',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        modelsEndpoint: '/models',
    },
    groq: {
        name: 'Groq',
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY,
        modelsEndpoint: '/models',
    },
    deepseek: {
        name: 'DeepSeek',
        baseURL: 'https://api.deepseek.com/v1',
        apiKey: process.env.DEEPSEEK_API_KEY,
        modelsEndpoint: '/models',
    },
    mistral: {
        name: 'Mistral',
        baseURL: 'https://api.mistral.ai/v1',
        apiKey: process.env.MISTRAL_API_KEY,
        modelsEndpoint: '/models',
    },
    huggingface: {
        name: 'HuggingFace',
        baseURL: 'https://api-inference.huggingface.co/v1',
        apiKey: process.env.HUGGINGFACE_API_KEY,
        modelsEndpoint: '/models',
    },
};

export function getProviderConfig(providerId: string): ProviderConfig | null {
    return providerConfigs[providerId] || null;
}

export function getAvailableProviders(): Array<{ id: string; name: string }> {
    return Object.entries(providerConfigs)
        .filter(([_, config]) => config.apiKey)
        .map(([id, config]) => ({ id, name: config.name }));
}
