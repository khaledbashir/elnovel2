import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Z.AI API endpoint for GLM Slide/Poster Agent
        const response = await fetch("https://api.z.ai/api/paas/v4/v1/agents", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.ZAI_API_KEY}`,
            },
            body: JSON.stringify({
                agent_id: "slides_glm_agent",
                stream: false, // We'll use non-streaming for simplicity
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt,
                            },
                        ],
                    },
                ],
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Z.AI Slides API error:", error);
            return NextResponse.json(
                { error: "Failed to generate slides" },
                { status: response.status }
            );
        }

        const data = await response.json();

        // The response should contain a PDF URL or the PDF data
        // Return it to the client
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error generating slides:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
