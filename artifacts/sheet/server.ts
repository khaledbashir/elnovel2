import { createDocumentHandler } from "@/lib/artifacts/server";

export const sheetDocumentHandler = createDocumentHandler({
  kind: "sheet",
  onCreateDocument: async ({ title, dataStream }) => {
    return "";
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    return document.content || "";
  },
});
