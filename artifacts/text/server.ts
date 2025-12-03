import { createDocumentHandler } from "@/lib/artifacts/server";

export const textDocumentHandler = createDocumentHandler({
  kind: "text",
  onCreateDocument: async ({ title, dataStream }) => {
    return "";
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    return document.content || "";
  },
});
