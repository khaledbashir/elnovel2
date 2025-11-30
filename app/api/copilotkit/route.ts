import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import OpenAI from "openai";

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: new CopilotRuntime(),
    serviceAdapter: new OpenAIAdapter({
        openai: new OpenAI({
            apiKey: process.env.ZAI_API_KEY,
            baseURL: process.env.ZAI_API_URL,
        }),
        keepSystemRole: true,
        model: process.env.ZAI_MODEL || "glm-4.6",
    }),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
