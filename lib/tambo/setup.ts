import {
  TamboComponent,
  TamboTool,
  currentTimeContextHelper,
  currentPageContextHelper,
} from "@tambo-ai/react";
import { z } from "zod";
import { SOWPricingTable, sowPricingSchema } from "@/components/pricing/sow-pricing-table";
import { FullSOWDocument, fullSOWSchema } from "@/components/sow/full-sow-document";
import { BriefUpload, briefUploadSchema } from "@/components/sow/brief-upload";

/**
 * Tambo Components Registration
 * Register components that Tambo AI can generate
 */
export const tamboComponents: TamboComponent[] = [
  {
    name: "FullSOWDocument",
    description:
      "Complete multi-scope Statement of Work document with interactive pricing tables. Use this for generating COMPLETE SOWs from client requirements. Each scope includes: title, description, interactive pricing table with role dropdowns (92 roles from rate card), hours, rates, deliverables (bullet list), and assumptions (bullet list). Supports drag-and-drop row reordering, real-time GST calculations (10%), discount application, and budget tracking. Account Management roles MUST be placed at the bottom of each scope. Use when client requests a full SOW with multiple scopes (e.g., 'HubSpot integration and 2 landing pages').",
    component: FullSOWDocument,
    propsSchema: fullSOWSchema,
  },
  {
    name: "SOWPricingTable",
    description:
      "Single-scope interactive SOW pricing table with roles, hours, rates, discounts, GST calculations, budget tracking, and drag-and-drop reordering. Use for simple, single-scope pricing. For multi-scope SOWs, use FullSOWDocument instead. MUST include deliverables, scope overview, and assumptions. Account Management roles MUST be placed at the bottom.",
    component: SOWPricingTable,
    propsSchema: sowPricingSchema,
  },
  {
    name: "BriefUpload",
    description:
      "Displays metadata and preview for an uploaded and parsed client brief PDF. Use after successfully ingesting a PDF brief with the ingest_client_brief tool. Shows file name, page count, word count, and brief preview.",
    component: BriefUpload,
    propsSchema: briefUploadSchema,
  },
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
  {
    name: "ingest_client_brief",
    description: "Upload and parse a client brief PDF to extract requirements for SOW generation. Use this when the user uploads a PDF brief or mentions uploading project requirements. Returns the extracted text content, page count, and metadata. After calling this tool, generate a BriefUpload component to confirm successful upload.",
    tool: async (params: { fileData: string; fileName: string }) => {
      try {
        // Convert base64 to blob
        const response = await fetch(params.fileData);
        const blob = await response.blob();

        // Create FormData
        const formData = new FormData();
        formData.append('file', blob, params.fileName);

        // Call server-side API
        const apiResponse = await fetch('/api/ingest-brief', {
          method: 'POST',
          body: formData,
        });

        if (!apiResponse.ok) {
          const error = await apiResponse.json();
          throw new Error(error.error || 'Failed to parse brief');
        }

        const result = await apiResponse.json();
        return {
          success: true,
          briefText: result.text,
          pages: result.pages,
          fileName: result.metadata.fileName,
          fileSize: result.metadata.fileSize,
          uploadedAt: result.metadata.uploadedAt,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to parse PDF brief',
        };
      }
    },
    toolSchema: z.function()
      .args(
        z.object({
          fileData: z.string().describe('Base64-encoded PDF file data (data URL)'),
          fileName: z.string().describe('Name of the PDF file'),
        })
      )
      .returns(
        z.object({
          success: z.boolean(),
          briefText: z.string().optional(),
          pages: z.number().optional(),
          fileName: z.string().optional(),
          fileSize: z.number().optional(),
          uploadedAt: z.string().optional(),
          error: z.string().optional(),
        })
      ),
  },
];

/**
 * Context Helpers Configuration
 * Prebuilt helpers for time and page context
 * Custom helpers can be added here for app-specific context
 */
export const tamboContextHelpers = {
  userTime: currentTimeContextHelper,
  userPage: currentPageContextHelper,

  // CRITICAL: Rate Card Context for SOW Generation
  // This injects the Social Garden Rate Card into every AI request
  rateCard: async () => {
    try {
      const response = await fetch('/api/rate-card');
      const data = await response.json();
      return {
        socialGardenRateCard: data.rateCard,
        totalRoles: data.metadata.totalRoles,
        currency: 'AUD', // Display currency (base rates are USD)
        message: `Social Garden Rate Card loaded with ${data.metadata.totalRoles} roles. MUST use exact roles and rates from this card.`,
      };
    } catch (error) {
      console.error('Failed to load rate card:', error);
      return {
        error: 'Rate card not available',
        message: 'WARNING: Rate card could not be loaded. SOW generation may be inaccurate.',
      };
    }
  },

  // Budget Compliance Rules
  budgetRules: () => {
    return {
      mandatoryRoles: [
        'Tech - Head Of- Senior Project Management',
        'Tech - Delivery - Project Coordination',
        'Account Management - (Account Manager)',
      ],
      accountManagementPosition: 'bottom',
      gstRate: 0.10,
      currency: 'AUD',
      roundingTargets: [100, 1000, 5000],
    };
  },
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
