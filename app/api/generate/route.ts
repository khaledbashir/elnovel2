import { createOpenAI } from "@ai-sdk/openai";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { streamText } from "ai";
import { match } from "ts-pattern";

// Configure direct Z.AI connection
const zaiApiKey = process.env.ZAI_API_KEY;

if (!zaiApiKey) {
  console.error("CRITICAL: No Z.AI API Key found");
}

const openai = createOpenAI({
  baseURL: 'https://api.z.ai/api/coding/paas/v4',
  apiKey: zaiApiKey,
});

export async function POST(req: Request): Promise<Response> {
  // Check if the ZAI_API_KEY is set, if not return 400
  if (!process.env.ZAI_API_KEY || process.env.ZAI_API_KEY === "") {
    return new Response("Missing ZAI_API_KEY - make sure to add it to your .env file.", {
      status: 400,
    });
  }
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const ip = req.headers.get("x-forwarded-for");
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
    });

    const { success, limit, reset, remaining } = await ratelimit.limit(`novel_ratelimit_${ip}`);

    if (!success) {
      return new Response("You have reached your request limit for the day.", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }
  }

  const { prompt, option, command } = await req.json();
  const messages = match(option)
    .with("continue", () => [
      {
        role: "system",
        content:
          "You are an AI writing assistant that continues existing text based on context from prior text. " +
          "Give more weight/priority to the later characters than the beginning ones. " +
          "Limit your response to no more than 200 characters, but make sure to construct complete sentences. " +
          "Use Markdown formatting when appropriate. " +
          "You MUST respond ONLY in English.",
      },
      {
        role: "user",
        content: prompt,
      },
    ])
    .with("improve", () => [
      {
        role: "system",
        content:
          "You are an AI writing assistant that improves existing text. " +
          "Limit your response to no more than 200 characters, but make sure to construct complete sentences. " +
          "Use Markdown formatting when appropriate. " +
          "You MUST respond ONLY in English.",
      },
      {
        role: "user",
        content: `The existing text is: ${prompt}`,
      },
    ])
    .with("shorter", () => [
      {
        role: "system",
        content:
          "You are an AI writing assistant that shortens existing text. " +
          "Use Markdown formatting when appropriate. " +
          "You MUST respond ONLY in English.",
      },
      {
        role: "user",
        content: `The existing text is: ${prompt}`,
      },
    ])
    .with("longer", () => [
      {
        role: "system",
        content:
          "You are an AI writing assistant that lengthens existing text. " +
          "Use Markdown formatting when appropriate. " +
          "You MUST respond ONLY in English.",
      },
      {
        role: "user",
        content: `The existing text is: ${prompt}`,
      },
    ])
    .with("fix", () => [
      {
        role: "system",
        content:
          "You are an AI writing assistant that fixes grammar and spelling errors in existing text. " +
          "Limit your response to no more than 200 characters, but make sure to construct complete sentences. " +
          "Use Markdown formatting when appropriate. " +
          "You MUST respond ONLY in English.",
      },
      {
        role: "user",
        content: `The existing text is: ${prompt}`,
      },
    ])
    .with("zap", () => [
      {
        role: "system",
        content:
          "You are an AI writing assistant that generates text based on a prompt. " +
          "You take an input from the user and a command for manipulating the text. " +
          "Use Markdown formatting when appropriate. " +
          "You MUST respond ONLY in English.",
      },
      {
        role: "user",
        content: `For this text: ${prompt}. You have to respect the command: ${command}`,
      },
    ])
    .run();

  try {
    const result = await streamText({
      // @ts-ignore - Type mismatch between @ai-sdk/provider versions
      model: openai("glm-4.6"),
      messages: messages as any,
      maxTokens: 2000, // Adjusted for typical editing tasks
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Z.AI API Error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return new Response(
      JSON.stringify({
        error: "Z.AI API call failed",
        message: error?.message || "Unknown error",
        details: error?.cause || error,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
