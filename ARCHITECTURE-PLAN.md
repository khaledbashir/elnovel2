# SOW Workbench - Architecture Plan
## Novel Editor + Tambo AI Integration

**Status:** In Progress  
**Goal:** Build a production-ready SOW (Statement of Work) generator using Novel editor + Tambo AI

---

## ✅ Progress Checklist

### Phase 1: Foundation
- [x] Clone Novel editor repository
- [x] Install dependencies
- [x] Get Novel editor running on localhost:3000
- [x] **Align colors with Social Garden brand** ✅
  - [x] Updated `globals.css` with SG Dark (#0e2e33) and SG Green (#20e28f)
  - [x] Added brand colors to Tailwind config (`sg-dark`, `sg-green`, etc.)
  - [x] Configured light/dark mode with brand colors
- [x] **Set up Vercel AI SDK for Novel editor** ✅
  - [x] Novel AI configured at `/api/generate/route.ts`
  - [x] Configured Z.AI (GLM-4.6) as OpenAI-compatible provider
  - [x] Updated to use Z.AI API instead of OpenAI
  - [x] Inline AI editing via `useCompletion` hook
  - [x] AI selector component working
  - [x] Removed GitHub/Documentation links from page
- [x] **Set up Tambo React SDK** ✅
  - [x] Installed `@tambo-ai/react@^0.64.1`
  - [x] Created Tambo setup configuration (`lib/tambo/setup.ts`)
  - [x] Registered PricingTable component for Tambo
  - [x] Added TamboProvider to app providers
  - [x] Created SidebarChat component
  - [ ] Environment variables configured (user needs to set up)
- [ ] Set up project structure
- [ ] Database schema design
- [ ] Basic workspace/document CRUD

### Phase 2: Core Features
- [ ] Document ↔ Tambo thread linking
- [ ] Chat interface integration
- [ ] Content insertion flow
- [ ] Auto-save functionality

### Phase 3: Pricing Table
- [ ] Pricing table component integration
- [ ] Tambo component registration
- [ ] Rate card validation
- [ ] Drag-and-drop functionality

### Phase 4: Polish & Export
- [ ] PDF export functionality
- [ ] UI/UX refinements
- [ ] Error handling
- [ ] Testing & deployment

---

## 📋 Project Overview

### What We're Building
A complete SOW Workbench application that:
- Uses **Novel editor** (Notion-like) as the main document editor
- Uses **Tambo AI** for chat interface and AI-powered generation
- Follows the "Architect" system prompt for generating professional SOWs
- Integrates with Social Garden rate card for accurate pricing
- Supports interactive pricing tables, deliverables, and professional PDF exports

### Core User Flow
1. User clicks on a workspace (client folder) → sees documents
2. User clicks on a document → opens Novel editor + linked Tambo chat thread
3. User chats with Tambo → AI generates SOW content based on system prompt
4. Content appears in chat → user clicks "Insert to Editor" → content goes into Novel
5. User edits in Novel → can continue chatting with Tambo for refinements
6. User exports professional PDF with Social Garden branding

---

## 🏗️ Architecture Overview

### High-Level Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
├──────────────┬──────────────────────┬───────────────────┤
│ Left Sidebar │   Novel Editor       │  Right Sidebar    │
│              │   (Document)         │  Tambo Chat       │
│ Workspaces   │                      │  (Thread)         │
│ Documents    │   - Rich Text        │                   │
│              │   - Pricing Table    │  - Chat History   │
│              │   - Deliverables     │  - Document Upload│
│              │   - Content Blocks   │  - AI Generation  │
└──────────────┴──────────────────────┴───────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  MySQL Database                         │
│  - workspaces (folders)                                 │
│  - documents (SOW docs, linked to tambo_thread_id)      │
│  - document_content (Novel editor content)              │
│  - pricing_data (pricing table data)                    │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Tambo Cloud/Self-Hosted                │
│  - Threads (1 per document)                             │
│  - System Prompt (configured in dashboard)              │
│  - Rate Card (as document/context)                      │
│  - Component Generation                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📐 Database Schema (MySQL)

### Tables Needed

```sql
-- Workspaces (client folders)
CREATE TABLE workspaces (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Documents (SOW documents)
CREATE TABLE documents (
  id VARCHAR(255) PRIMARY KEY,
  workspace_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  tambo_thread_id VARCHAR(255), -- Links to Tambo thread
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Document Content (Novel editor content)
CREATE TABLE document_content (
  document_id VARCHAR(255) PRIMARY KEY,
  content_json JSON NOT NULL, -- TipTap/Novel JSON format
  content_markdown TEXT, -- Optional: markdown backup
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Pricing Data (structured pricing table data)
CREATE TABLE pricing_data (
  document_id VARCHAR(255) PRIMARY KEY,
  pricing_json JSON NOT NULL, -- { rows: [...], discount: 0, totals: {...} }
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);
```

### Key Relationships
- **1 Workspace → Many Documents**
- **1 Document → 1 Tambo Thread** (via `tambo_thread_id`)
- **1 Document → 1 Content** (Novel editor content)
- **1 Document → 1 Pricing Data** (pricing table)

---

## 🎨 Frontend Architecture

### Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main dashboard
│   └── [workspace]/[document]/
│       └── page.tsx            # Document view (Novel + Tambo)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Workspace/Document navigation
│   │   ├── EditorPanel.tsx     # Novel editor container
│   │   └── ChatPanel.tsx       # Tambo chat container
│   ├── novel/
│   │   ├── NovelEditor.tsx     # Novel editor wrapper
│   │   └── extensions/
│   │       └── PricingTableExtension.tsx  # Custom Novel extension
│   ├── tambo/
│   │   ├── TamboChat.tsx       # Tambo chat wrapper
│   │   └── InsertButton.tsx    # Insert to Editor button
│   └── pricing/
│       └── PricingTable.tsx    # Standalone pricing table (exists)
├── lib/
│   ├── tambo/
│   │   ├── setup.ts            # Tambo provider setup
│   │   ├── components.ts       # Component registrations
│   │   └── utils.ts            # Tambo utilities
│   ├── novel/
│   │   ├── editor.ts           # Novel editor config
│   │   └── extensions.ts       # Custom extensions
│   ├── database/
│   │   ├── workspaces.ts       # Workspace operations
│   │   ├── documents.ts        # Document operations
│   │   └── content.ts          # Content operations
│   └── rate-card.ts            # Rate card data
└── types/
    └── index.ts                # Shared TypeScript types
```

---

## 🔗 Integration Points

### 1. Document ↔ Tambo Thread Linking

**Flow:**
- When document is created → create Tambo thread → store `tambo_thread_id`
- When document is opened → load Novel content + switch to Tambo thread
- Chat in Tambo → generate content → insert into Novel

**Implementation:**
```typescript
// On document open
async function openDocument(documentId: string) {
  const doc = await getDocument(documentId);
  const content = await getDocumentContent(documentId);
  
  // Load Novel editor with content
  setNovelContent(content.content_json);
  
  // Switch Tambo thread
  if (doc.tambo_thread_id) {
    switchThread(doc.tambo_thread_id);
  } else {
    // Create new thread for this document
    const thread = await createTamboThread(doc.name);
    await updateDocument(documentId, { tambo_thread_id: thread.id });
  }
}
```

### 2. Tambo → Novel Content Insertion

**Flow:**
- Tambo generates response → parse for components/pricing table
- Show "Insert to Editor" button in chat
- On click → convert to Novel format → insert at cursor/append

**Components to Register:**
1. **PricingTable** - Interactive pricing table component
2. **DeliverablesList** - Structured deliverables list
3. **SOWSection** - Standard SOW sections (Overview, Assumptions, etc.)

### 3. Pricing Table Integration

**Two Approaches:**

**Option A: Novel Extension**
- Custom Novel extension for pricing tables
- Editable directly in Novel editor
- Stores data in pricing_data table

**Option B: Tambo Component → Insert as Table**
- Tambo generates pricing table component
- Inserts as formatted table in Novel
- Can edit in Novel but loses structure

**Recommendation:** Start with Option B (simpler), upgrade to Option A if needed.

---

## 🤖 Tambo Configuration

### Components to Register

```typescript
import { PricingTable } from '@/components/pricing/PricingTable';
import { z } from 'zod';

const tamboComponents = [
  {
    name: "PricingTable",
    description: "Interactive pricing table with roles, hours, rates, discounts, and GST calculations. Use when generating project pricing.",
    component: PricingTable,
    propsSchema: z.object({
      rows: z.array(z.object({
        id: z.string(),
        role: z.string(),
        description: z.string(),
        hours: z.number(),
        rate: z.number(),
      })),
      discount: z.number().default(0),
    }),
  },
  // Add more components as needed
];
```

### System Prompt Setup (Manual in Tambo Dashboard)

The system prompt from `novel/systempropmt` should be:
1. Copied to Tambo dashboard as "Custom Instructions"
2. Rate card uploaded as document/context in Tambo workspace
3. Model selection (OpenAI, Anthropic, etc.) configured in dashboard

---

## 📊 Data Flow

### Content Generation Flow

```
User Message in Tambo Chat
         ↓
Tambo Processes (uses system prompt + rate card)
         ↓
Tambo Returns Response:
  - Text content
  - Component (PricingTable) with props
         ↓
Chat Displays:
  - Text response
  - Rendered PricingTable component
  - "Insert to Editor" button
         ↓
User Clicks "Insert to Editor"
         ↓
Extract Content:
  - Parse text → markdown
  - Extract pricing table JSON
         ↓
Insert into Novel:
  - Markdown → TipTap JSON
  - Pricing table → formatted table or custom block
         ↓
Save to Database:
  - Update document_content
  - Update pricing_data
```

### Document Editing Flow

```
User Edits in Novel Editor
         ↓
Auto-save on change (debounced)
         ↓
Update document_content table
         ↓
Pricing table changes → update pricing_data table
```

---

## 🎯 Key Features

### 1. Workspace Management
- ✅ Create/Edit/Delete workspaces (folders)
- ✅ List documents in workspace
- ✅ Search workspaces

### 2. Document Management
- ✅ Create/Edit/Delete documents
- ✅ Link document to Tambo thread
- ✅ Auto-create thread on first chat

### 3. Novel Editor Integration
- ✅ Rich text editing
- ✅ Pricing table support (standard table or custom extension)
- ✅ Auto-save on changes
- ✅ Export to PDF

### 4. Tambo Chat Integration
- ✅ Chat interface in sidebar
- ✅ Document upload for client briefs
- ✅ Component generation (PricingTable, etc.)
- ✅ Content insertion to editor

### 5. Pricing Table Features
- ✅ Editable rows (role, description, hours, rate)
- ✅ Drag-and-drop reordering
- ✅ Discount calculation
- ✅ GST calculation (10%)
- ✅ Rate card validation
- ✅ Account Management roles at bottom

### 6. PDF Export
- ✅ Professional branding (Social Garden logo)
- ✅ Plus Jakarta Sans font
- ✅ Includes pricing table
- ✅ Formatted SOW structure

---

## ❓ Big Picture Questions to Answer

### 1. **Content Insertion UX**
When Tambo generates content, how should it appear?
- [ ] Button-based: Show "Insert to Editor" button in chat
- [ ] Auto-insert: Automatically insert at cursor as it generates
- [ ] Preview panel: Show preview, then insert on approval

### 2. **Pricing Table Location**
Where should the pricing table live?
- [ ] In Novel editor (as custom block/extension)
- [ ] Rendered in chat, inserted as formatted table
- [ ] Both: Render in chat, also editable in Novel

### 3. **PDF Export Method**
How should PDFs be generated?
- [ ] Client-side: In browser using Novel content
- [ ] Server-side: API endpoint that generates PDF
- [ ] Hybrid: Client collects data → server generates PDF

### 4. **Rate Card Validation**
How should we validate roles match rate card?
- [ ] Client-side validation after Tambo generation
- [ ] Tambo tool/MCP that enforces rate card
- [ ] Post-processing that fixes invalid roles

### 5. **Document Upload**
For client briefs (PDF/Word), should we:
- [ ] Use Tambo's built-in document upload
- [ ] Custom upload → our backend → pass to Tambo
- [ ] Both (custom UI, Tambo backend)

### 6. **Auto-save Strategy**
How often should Novel content auto-save?
- [ ] Real-time (debounced, every few seconds)
- [ ] On blur (when user clicks away)
- [ ] Manual save button

### 7. **Tambo API Setup**
- [ ] Do you have a Tambo API key?
- [ ] Using Tambo Cloud or self-hosting?
- [ ] Which LLM provider? (OpenAI, Anthropic, etc.)

### 8. **Project Location**
Where should the main app live?
- [ ] `frontend/` directory (new Next.js app)
- [ ] `novel/apps/web` (existing Novel app, add Tambo)
- [ ] New separate app directory

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up Next.js app structure
- [ ] Database schema and migrations
- [ ] Basic workspace/document CRUD
- [ ] Novel editor integration
- [ ] Tambo provider setup

### Phase 2: Core Features (Week 2)
- [ ] Document ↔ Tambo thread linking
- [ ] Chat interface integration
- [ ] Content insertion flow
- [ ] Auto-save functionality

### Phase 3: Pricing Table (Week 3)
- [ ] Pricing table component integration
- [ ] Tambo component registration
- [ ] Rate card validation
- [ ] Drag-and-drop functionality

### Phase 4: Polish & Export (Week 4)
- [ ] PDF export functionality
- [ ] UI/UX refinements
- [ ] Error handling
- [ ] Testing & deployment

---

## 📝 Next Steps

1. **Review this plan** - Does this align with your vision?
2. **Answer big picture questions** - These will guide technical decisions
3. **Confirm Tambo setup** - API key, provider, self-hosted vs cloud
4. **Start Phase 1** - Begin foundation work

---

## 🔗 Key Resources

- **Novel Editor:** https://novel.sh/
- **Tambo AI:** https://tambo.co/
- **Rate Card:** `novel/ratecard`
- **System Prompt:** `novel/systempropmt`
- **Pricing Table Component:** `novel/pricingtale`

---

**Last Updated:** January 2025  
**Status:** Awaiting feedback on big picture questions
