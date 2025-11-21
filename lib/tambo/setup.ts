import {
  TamboComponent,
  TamboTool,
  currentTimeContextHelper,
  currentPageContextHelper,
} from "@tambo-ai/react";
import { z } from "zod";
import PricingTable from "@/components/pricing/pricing-table";

/**
 * Tambo Components Registration
 * Register components that Tambo AI can generate
 */
export const tamboComponents: TamboComponent[] = [
  {
    name: "PricingTable",
    description:
      "Interactive pricing table with roles, hours, rates, discounts, and GST calculations. Use when generating project pricing for SOW documents.",
    component: PricingTable,
    propsSchema: z.object({
      rows: z.array(
        z.object({
          id: z.string(),
          role: z.string(),
          description: z.string(),
          hours: z.number(),
          rate: z.number(),
        })
      ),
      discount: z.number().default(0),
      onUpdate: z.function().optional(),
    }),
  },
  // If you want to register a custom Interactable editor with Tambo,
  // add it here. We won't auto-register custom editors in the default setup
  // to keep the integration minimal and avoid modifying editor behavior.
  // Add more components as needed:
  // - DeliverablesList
  // - SOWSection
  // - etc.
];

/**
 * Tambo Tools Registration
 * Register tools that Tambo AI can call
 */
export const tamboTools: TamboTool[] = [
  {
    name: "getCurrentTime",
    description: "A tool to get the current time and date",
    tool: () => {
      return new Date().toISOString();
    },
    toolSchema: z.function().returns(z.string()),
  },
  // Add more tools as needed:
  // - Database queries
  // - API calls
  // - File operations
  // - etc.
];

/**
 * Context Helpers Configuration
 * Prebuilt helpers for time and page context
 * Custom helpers can be added here for app-specific context
 */
export const tamboContextHelpers = {
  userTime: currentTimeContextHelper,
  userPage: currentPageContextHelper,
  // Add custom context helpers here:
  // userProfile: async () => {
  //   const profile = await getUserProfile();
  //   return { name: profile.name, role: profile.role };
  // },
  // appState: () => {
  //   return { currentWorkspace: getCurrentWorkspace(), theme: getTheme() };
  // },
};

/**
 * Tambo Configuration
 * Get configuration from environment variables
 */
export function getTamboConfig() {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;
  const tamboUrl = process.env.NEXT_PUBLIC_TAMBO_URL || "https://api.tambo.co";
  const projectId = process.env.NEXT_PUBLIC_TAMBO_PROJECT_ID;

  if (!apiKey) {
    console.warn(
      "Tambo API key not found. Please set NEXT_PUBLIC_TAMBO_API_KEY in your .env.local file."
    );
  }

  return {
    apiKey: apiKey || "",
    tamboUrl,
    projectId,
    components: tamboComponents,
    tools: tamboTools,
    contextHelpers: tamboContextHelpers,
  };
}
