import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Z.AI Provider Configuration
const zaiProvider = createOpenAI({
    baseURL: process.env.ZAI_API_URL || 'https://api.z.ai/api/coding/paas/v4',
    apiKey: "18f65090a96a425898a8398a5c4518ce.DDtUvTTnUmK020Wx",
});

const model = zaiProvider('glm-4.6');

export const componentGeneratorTool = {
    description: 'Generate a React component based on a description. Use this when the user asks to "create a component", "design a UI", or "make a [specific UI element]".',
    parameters: z.object({
        description: z.string().describe('Description of the component to generate'),
        name: z.string().describe('Name of the component (PascalCase)'),
    }),
    execute: async ({ description, name }: { description: string, name: string }) => {
        const prompt = `
        You are an expert React developer. Generate a high-quality, modern React component using Tailwind CSS.
        
        Component Name: ${name}
        Description: ${description}
        
        Requirements:
        - Use functional components with TypeScript.
        - Use Tailwind CSS for styling.
        - Use Lucide React for icons if needed (import from 'lucide-react').
        - Do NOT use any other external libraries unless absolutely necessary and standard (e.g. clsx, tailwind-merge).
        - Return ONLY the code for the component.
        `;

        const { object } = await generateObject({
            model: model as any,
            schema: z.object({
                code: z.string().describe('The full React component code'),
                explanation: z.string().describe('Brief explanation of the design choices'),
            }),
            prompt,
        });

        return JSON.stringify({
            type: 'component_generated',
            name,
            code: object.code,
            explanation: object.explanation
        });
    },
};
