import { createDocumentHandler } from "@/lib/artifacts/server";

export const codeDocumentHandler = createDocumentHandler({
  kind: "code",
  onCreateDocument: async ({ title, dataStream }) => {
    return "";
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    return document.content || "";
  },
});
