# 📜 Papyrus Migration Plan
## Unified Stack: Vercel AI SDK + RAG Only

---

## 🎯 Goal

**Rebrand to "Papyrus"** and unify the tech stack:
- ✅ **Keep:** Vercel AI SDK (chat, streaming, tools)
- ✅ **Add:** Vercel AI SDK RAG (replace AnythingLLM)
- ❌ **Remove:** Tambo AI (generative UI)
- ❌ **Remove:** AnythingLLM (external knowledge base)

---

## 📊 Current State Analysis

### **What You Currently Have:**

#### ✅ **Vercel AI SDK (Already Working!)**
- Location: `/app/api/chat/route.ts`
- Provider: Z.AI via Vercel Gateway
- Model: `glm-4.6`
- Features:
  - ✅ Streaming chat
  - ✅ Tool calling (create_plan, update_step, render_artifact)
  - ✅ Component generation
  - ✅ Basic RAG (`getInformation` tool with vector search)

#### ❌ **Tambo AI (To Remove)**
Files using Tambo:
- `/lib/tambo/setup.ts` - Tambo configuration
- `/components/sow/brief-upload.tsx` - Uses `withInteractable`
- `/components/pricing/sow-pricing-table.tsx` - Uses `withInteractable`
- `/components/agents/agent-selector.tsx` - Uses `useTamboThread`
- `/components/ui/file-upload-new/components/document-uploader.tsx` - Uses `useTamboContextAttachment`
- `/my-tambo-app/` - Entire demo app

#### ❌ **AnythingLLM (To Replace)**
Files using AnythingLLM:
- `/lib/anything-llm.ts` - AnythingLLM client
- `/app/api/ingest-brief/route.ts` - Upload PDFs to AnythingLLM
- `/app/api/consult-knowledge-base/route.ts` - Query AnythingLLM
- `/check-anythingllm-status.ts` - Health check script

#### ⚠️ **Hybrid RAG (Current)**
You have TWO RAG systems running:
1. **Vercel Vector DB** - `/lib/vector-db.ts` (ChromaDB)
2. **AnythingLLM** - External service

---

## 🗺️ Migration Strategy

### **Phase 1: Rebranding (Visual Only)**
**Time:** 1-2 hours  
**Risk:** Low

1. Update app name to "Papyrus"
2. Change colors/theme
3. Update metadata
4. Replace favicon
5. Update all UI text

### **Phase 2: Remove Tambo AI**
**Time:** 2-3 hours  
**Risk:** Medium (breaks SOW features)

1. Remove Tambo packages
2. Delete `/my-tambo-app/`
3. Refactor components using Tambo hooks
4. Remove Tambo-specific SOW components (or generalize)

### **Phase 3: Consolidate RAG to Vercel Only**
**Time:** 3-4 hours  
**Risk:** Medium (need to migrate data)

1. Remove AnythingLLM integration
2. Enhance Vercel vector DB
3. Add document upload to Vercel RAG
4. Migrate existing knowledge base (if needed)

---

## ✅ What's Already Unified

Good news! You already have:

### **1. Vercel AI SDK Chat** ✅
```typescript
// /app/api/chat/route.ts
const openai = createOpenAI({
    baseURL: 'https://gateway.ai.vercel.dev/v1',
    apiKey: gatewayKey,
});

const result = await streamText({
    model: openai('glm-4.6'),
    messages: convertToCoreMessages(messages),
    tools: { ... }
});
```

### **2. Vercel Vector DB (ChromaDB)** ✅
```typescript
// /lib/vector-db.ts
// Already using ChromaDB for vector search!
export async function searchSimilar(query: string) {
    const collection = await client.getOrCreateCollection({ name: "documents" });
    const results = await collection.query({
        queryTexts: [query],
        nResults: 5,
    });
    return results;
}
```

### **3. Document Upload** ✅
```typescript
// /lib/document-manager.ts
// Already have document ingestion!
```

---

## 🚀 Step-by-Step Migration

### **STEP 1: Rebrand to Papyrus** 🎨

#### 1.1 Update `package.json`
```json
{
  "name": "papyrus",
  "description": "AI-Powered Document Intelligence Platform",
  "version": "2.0.0"
}
```

#### 1.2 Update `app/layout.tsx`
```typescript
export const metadata: Metadata = {
  title: "Papyrus - AI Document Platform",
  description: "Smart documents powered by AI",
};
```

#### 1.3 Update Colors (`tailwind.config.ts`)
**Papyrus Theme: Ancient Scroll + Modern Tech**
```typescript
colors: {
  primary: {
    DEFAULT: "#8b7355", // Papyrus brown
    foreground: "#ffffff",
  },
  secondary: {
    DEFAULT: "#d4a574", // Light papyrus
    foreground: "#1a1a1a",
  },
  accent: {
    DEFAULT: "#3b82f6", // Modern blue (AI)
    foreground: "#ffffff",
  },
}
```

#### 1.4 Search & Replace
```bash
# Find all "Novel" references
grep -r "Novel" --include="*.tsx" --include="*.ts" .

# Replace with "Papyrus"
# (Do manually or use sed)
```

---

### **STEP 2: Remove Tambo AI** ❌

#### 2.1 Uninstall Packages
```bash
pnpm remove @tambo-ai/react @tambo-ai/typescript-sdk
```

#### 2.2 Delete Files
```bash
rm -rf my-tambo-app/
rm -rf lib/tambo/
rm components/sow/brief-upload.tsx
rm components/pricing/sow-pricing-table.tsx
```

#### 2.3 Refactor Components

**Before (agent-selector.tsx):**
```typescript
import { useTamboThread } from "@tambo-ai/react";
const { startNewThread } = useTamboThread();
```

**After:**
```typescript
// Use your own thread management
const startNewThread = async (config: any) => {
  const response = await fetch('/api/chat/threads', {
    method: 'POST',
    body: JSON.stringify(config)
  });
};
```

#### 2.4 Remove from `.env`
```bash
# Remove these
NEXT_PUBLIC_TAMBO_API_KEY
NEXT_PUBLIC_TAMBO_URL
NEXT_PUBLIC_TAMBO_PROJECT_ID
```

---

### **STEP 3: Remove AnythingLLM** ❌

#### 3.1 Delete Files
```bash
rm lib/anything-llm.ts
rm check-anythingllm-status.ts
rm app/api/ingest-brief/route.ts
rm app/api/consult-knowledge-base/route.ts
```

#### 3.2 Remove from `.env`
```bash
# Remove these
ANYTHING_LLM_URL
ANYTHING_LLM_API_KEY
ANYTHING_LLM_WORKSPACE_SLUG
```

#### 3.3 Enhance Vercel RAG

**Create `/lib/rag/index.ts`:**
```typescript
import { ChromaClient } from 'chromadb';
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';

const client = new ChromaClient();

export async function ingestDocument(text: string, metadata: any) {
  const collection = await client.getOrCreateCollection({ 
    name: "papyrus_knowledge" 
  });
  
  // Generate embedding
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  
  // Store in ChromaDB
  await collection.add({
    ids: [metadata.id],
    embeddings: [embedding],
    documents: [text],
    metadatas: [metadata],
  });
}

export async function queryKnowledge(question: string) {
  const collection = await client.getCollection({ 
    name: "papyrus_knowledge" 
  });
  
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: question,
  });
  
  const results = await collection.query({
    queryEmbeddings: [embedding],
    nResults: 5,
  });
  
  return results;
}
```

---

### **STEP 4: Update Chat API** 🔄

**Enhance `/app/api/chat/route.ts`:**

```typescript
import { queryKnowledge } from '@/lib/rag';

// Update the getInformation tool
getInformation: {
  description: 'Search the knowledge base for relevant information',
  parameters: z.object({
    question: z.string(),
  }),
  execute: async ({ question }) => {
    const results = await queryKnowledge(question);
    return JSON.stringify(results);
  },
}
```

---

### **STEP 5: Add Document Upload API** 📤

**Create `/app/api/documents/ingest/route.ts`:**

```typescript
import { NextRequest } from 'next/server';
import { ingestDocument } from '@/lib/rag';
import pdf from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    // Parse PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);
    
    // Ingest to RAG
    await ingestDocument(data.text, {
      id: crypto.randomUUID(),
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
    });
    
    return Response.json({ 
      success: true, 
      message: 'Document ingested successfully' 
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 📋 Migration Checklist

### **Phase 1: Rebranding** ✅
- [ ] Update `package.json` name to "papyrus"
- [ ] Update `app/layout.tsx` metadata
- [ ] Update `tailwind.config.ts` colors
- [ ] Replace favicon with papyrus icon
- [ ] Search/replace "Novel" → "Papyrus"
- [ ] Search/replace "Social Garden" → remove
- [ ] Update README.md

### **Phase 2: Remove Tambo** ❌
- [ ] `pnpm remove @tambo-ai/react @tambo-ai/typescript-sdk`
- [ ] Delete `/my-tambo-app/`
- [ ] Delete `/lib/tambo/`
- [ ] Delete SOW components (or generalize)
- [ ] Refactor `agent-selector.tsx`
- [ ] Refactor `document-uploader.tsx`
- [ ] Remove Tambo env vars
- [ ] Test build

### **Phase 3: Remove AnythingLLM** ❌
- [ ] Delete `/lib/anything-llm.ts`
- [ ] Delete `/app/api/ingest-brief/route.ts`
- [ ] Delete `/app/api/consult-knowledge-base/route.ts`
- [ ] Delete `check-anythingllm-status.ts`
- [ ] Remove AnythingLLM env vars
- [ ] Test build

### **Phase 4: Enhance Vercel RAG** ✅
- [ ] Create `/lib/rag/index.ts`
- [ ] Implement `ingestDocument()`
- [ ] Implement `queryKnowledge()`
- [ ] Create `/app/api/documents/ingest/route.ts`
- [ ] Update chat API `getInformation` tool
- [ ] Test document upload
- [ ] Test knowledge queries

### **Phase 5: Testing** 🧪
- [ ] Test chat functionality
- [ ] Test document upload
- [ ] Test knowledge base queries
- [ ] Test agent system
- [ ] Test editor
- [ ] Test PDF export
- [ ] Push to GitHub
- [ ] Deploy to EasyPanel

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Tambo removal breaks SOW** | High | Generalize or remove SOW features |
| **AnythingLLM data loss** | Medium | Export data first (if needed) |
| **RAG quality degrades** | Medium | Test thoroughly, tune embeddings |
| **Build failures** | High | Test locally first (if possible) |
| **User data loss** | Critical | Backup database before migration |

---

## 🎯 Recommended Approach

### **Option A: Minimal (Fastest - 2-3 hours)**
1. Rebrand to Papyrus (colors, name)
2. Keep Tambo & AnythingLLM for now
3. Just visual changes
4. **Deploy and test**

### **Option B: Remove Tambo Only (Medium - 4-5 hours)**
1. Rebrand to Papyrus
2. Remove Tambo AI
3. Keep AnythingLLM
4. Generalize/remove SOW features
5. **Deploy and test**

### **Option C: Full Migration (Thorough - 8-10 hours)**
1. Rebrand to Papyrus
2. Remove Tambo AI
3. Remove AnythingLLM
4. Enhance Vercel RAG
5. Migrate all data
6. **Deploy and test**

---

## 💡 My Recommendation

**Start with Option B:**
1. **Rebrand to Papyrus** (visual only)
2. **Remove Tambo** (it's not critical)
3. **Keep AnythingLLM** (it's working, don't break it yet)
4. **Test everything**
5. **Then** migrate to Vercel RAG later

This gives you:
- ✅ New branding immediately
- ✅ Cleaner codebase (no Tambo)
- ✅ Stable RAG (AnythingLLM still works)
- ✅ Lower risk
- ✅ Can migrate RAG later when ready

---

## 🚀 Ready to Start?

**Tell me which option you want:**
- **A:** Just rebrand (keep everything)
- **B:** Rebrand + Remove Tambo (keep AnythingLLM)
- **C:** Full migration (remove both)

I'll execute it step-by-step! 📜
