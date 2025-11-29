# 🎨 Complete Rebranding Guide
## Transforming Social Garden SOW App → Generic AI Document Assistant

---

## 📋 Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [Rebranding Checklist](#rebranding-checklist)
3. [Brand Identity](#brand-identity)
4. [Code Changes Required](#code-changes-required)
5. [Database Schema Changes](#database-schema-changes)
6. [Feature Generalization](#feature-generalization)
7. [Implementation Steps](#implementation-steps)

---

## 🔍 Current State Analysis

### **What This App Currently Does:**
- ✅ Generates **Statement of Work (SOW)** documents for Social Garden clients
- ✅ Uses **Social Garden rate card** (92 roles with specific pricing)
- ✅ Has **Social Garden branding** (colors, terminology, workflows)
- ✅ Specific to **agency/consulting** business model
- ✅ Uses **Tambo AI** for generative UI components
- ✅ Has **AnythingLLM** integration for knowledge base

### **Social Garden-Specific Elements to Remove:**
1. **Rate Card** - 92 roles with AUD pricing
2. **SOW Templates** - Agency-specific structure
3. **Branding** - Colors, logos, terminology
4. **Business Logic** - GST calculations, account management roles
5. **Workflow** - Client brief → SOW generation

---

## ✅ Rebranding Checklist

### **Phase 1: Brand Identity**
- [ ] Choose new app name
- [ ] Define color palette
- [ ] Create logo/favicon
- [ ] Define typography
- [ ] Write tagline/description

### **Phase 2: Visual Rebranding**
- [ ] Update `tailwind.config.ts` colors
- [ ] Update `app/layout.tsx` metadata
- [ ] Replace favicon files
- [ ] Update `package.json` name/description
- [ ] Update all UI text/labels

### **Phase 3: Feature Generalization**
- [ ] Remove Social Garden rate card
- [ ] Generalize SOW → Document templates
- [ ] Remove AUD/GST-specific logic
- [ ] Make pricing/roles configurable
- [ ] Simplify document generation

### **Phase 4: Code Cleanup**
- [ ] Remove `/my-tambo-app/` (demo app)
- [ ] Clean up unused components
- [ ] Update environment variables
- [ ] Remove client-specific APIs
- [ ] Update documentation

---

## 🎨 Brand Identity (FILL THIS OUT!)

### **1. App Name**
```
Current: "Novel" / "Social Garden SOW Generator"
New:     [YOUR_APP_NAME_HERE]

Suggestions:
- DocuMind AI
- SmartDocs
- ProposalCraft
- DocuFlow AI
- ThinkDocs
```

### **2. Tagline**
```
Current: "AI-Powered SOW Generation"
New:     [YOUR_TAGLINE_HERE]

Suggestions:
- "AI-Powered Document Intelligence"
- "Your AI Document Assistant"
- "Smart Documents, Powered by AI"
```

### **3. Color Palette**
```css
/* Current (Social Garden) */
--primary: Blue/Purple tones
--accent: Social Garden brand colors

/* New (Choose One) */

Option A: Modern Tech (Blue/Cyan)
--primary: #0ea5e9 (Sky Blue)
--secondary: #06b6d4 (Cyan)
--accent: #8b5cf6 (Purple)

Option B: Professional (Navy/Gold)
--primary: #1e40af (Navy)
--secondary: #f59e0b (Amber)
--accent: #10b981 (Emerald)

Option C: Creative (Purple/Pink)
--primary: #8b5cf6 (Purple)
--secondary: #ec4899 (Pink)
--accent: #06b6d4 (Cyan)

Option D: Minimal (Slate/Blue)
--primary: #0f172a (Slate)
--secondary: #3b82f6 (Blue)
--accent: #6366f1 (Indigo)
```

### **4. Typography**
```
Current: Inter (default)
New:     [CHOOSE_FONT]

Options:
- Inter (modern, clean)
- Outfit (rounded, friendly)
- Manrope (professional)
- Plus Jakarta Sans (elegant)
```

### **5. Use Case**
```
Current: Agency SOW generation
New:     [YOUR_USE_CASE]

Options:
- General business document generation
- Proposal/quote builder
- AI writing assistant
- Knowledge management system
- Multi-purpose AI chat + documents
```

---

## 💻 Code Changes Required

### **1. Update `package.json`**
```json
{
  "name": "[your-app-name]",
  "description": "[Your app description]",
  "version": "2.0.0",
  "author": "[Your Name/Company]"
}
```

### **2. Update `app/layout.tsx` Metadata**
```typescript
export const metadata: Metadata = {
  title: "[Your App Name]",
  description: "[Your app description]",
  icons: {
    icon: "/favicon.ico",
  },
};
```

### **3. Update `tailwind.config.ts` Colors**
```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "[YOUR_PRIMARY_COLOR]",
        foreground: "[YOUR_TEXT_COLOR]",
      },
      secondary: {
        DEFAULT: "[YOUR_SECONDARY_COLOR]",
        foreground: "[YOUR_TEXT_COLOR]",
      },
      accent: {
        DEFAULT: "[YOUR_ACCENT_COLOR]",
        foreground: "[YOUR_TEXT_COLOR]",
      },
    },
  },
}
```

### **4. Files to Update/Remove**

#### **Remove (Social Garden Specific):**
```
❌ /lib/tambo/ratecard.json
❌ /components/sow/brief-upload.tsx
❌ /components/pricing/sow-pricing-table.tsx
❌ /components/sow/full-sow-document.tsx
❌ /my-tambo-app/ (entire directory)
❌ /lib/tambo/setup.ts (or heavily modify)
```

#### **Update (Generalize):**
```
🔄 /app/page.tsx - Update welcome text
🔄 /components/sidebar.tsx - Update branding
🔄 /lib/tambo/setup.ts - Remove rate card references
🔄 All component labels/text
```

### **5. Environment Variables to Update**
```bash
# Remove Social Garden specific
❌ NEXT_PUBLIC_TAMBO_PROJECT_ID (if keeping Tambo, create new project)

# Keep/Update
✅ ZAI_API_KEY
✅ DATABASE_URL
✅ ANYTHING_LLM_URL (if keeping)

# Add New
NEXT_PUBLIC_APP_NAME="[Your App Name]"
NEXT_PUBLIC_APP_URL="[Your Domain]"
```

---

## 🗄️ Database Schema Changes

### **Current Schema Issues:**
- Tables reference "SOW" terminology
- Agent system is generic (can keep!)
- Workspaces/threads are generic (can keep!)

### **Recommended Changes:**

#### **Option A: Keep Current Schema (Easiest)**
Just rename in UI, keep database as-is:
- `sow_*` tables → Just change UI labels to "Documents"
- Agents → Keep as-is ✅
- Threads/Messages → Keep as-is ✅

#### **Option B: Rename Tables (Clean but requires migration)**
```sql
-- Rename SOW tables to generic names
ALTER TABLE sow_documents RENAME TO documents;
ALTER TABLE sow_pricing RENAME TO document_items;
-- etc.
```

**Recommendation:** **Option A** - Keep schema, just change UI labels!

---

## 🔧 Feature Generalization

### **1. SOW Generation → Document Generation**

#### **Current Flow:**
```
Upload Client Brief → Parse PDF → Generate SOW with Rate Card → Export PDF
```

#### **New Generic Flow:**
```
Upload Document/Context → AI Analysis → Generate Custom Document → Export
```

#### **Changes Needed:**
- Remove hardcoded rate card
- Make document templates configurable
- Allow custom fields/sections
- Remove GST/AUD-specific calculations

### **2. Tambo Components to Generalize**

#### **Current (Social Garden Specific):**
```typescript
// lib/tambo/setup.ts
export const tamboComponents = [
  {
    name: "FullSOWDocument",
    description: "Social Garden SOW with rate card...",
    // ...
  },
  {
    name: "SOWPricingTable",
    // ...
  },
];
```

#### **New (Generic):**
```typescript
export const tamboComponents = [
  {
    name: "DocumentBuilder",
    description: "Create custom documents with AI assistance",
    // ...
  },
  {
    name: "PricingTable",
    description: "Flexible pricing/quote table",
    // ...
  },
];
```

### **3. Remove These Specific Features:**
- ❌ Social Garden rate card (92 roles)
- ❌ Mandatory "Account Management" roles
- ❌ GST calculations (or make currency/tax configurable)
- ❌ AUD-specific pricing
- ❌ "Brief upload" workflow (or generalize to "Document upload")

### **4. Keep These Generic Features:**
- ✅ AI Chat (Vercel AI SDK)
- ✅ Agent System (custom AI personalities)
- ✅ Document Upload
- ✅ Knowledge Base (AnythingLLM)
- ✅ Thread/Workspace management
- ✅ Rich text editor (Novel)

---

## 📝 Implementation Steps

### **Step 1: Define Your Brand (Do This First!)**
1. Fill out the [Brand Identity](#brand-identity) section above
2. Choose app name, colors, fonts
3. Create/find a logo (or use emoji for now)

### **Step 2: Visual Rebranding (Quick Wins)**
```bash
# 1. Update package.json
# 2. Update tailwind.config.ts colors
# 3. Update app/layout.tsx metadata
# 4. Replace favicon
# 5. Update all "Social Garden" text in UI
```

### **Step 3: Remove Social Garden Code**
```bash
# Delete Social Garden specific files
rm -rf my-tambo-app/
rm lib/tambo/ratecard.json
rm components/sow/brief-upload.tsx
rm components/pricing/sow-pricing-table.tsx
rm components/sow/full-sow-document.tsx

# Or move to archive
mkdir archive/
mv my-tambo-app/ archive/
mv lib/tambo/ratecard.json archive/
```

### **Step 4: Generalize Tambo Setup**
```typescript
// lib/tambo/setup.ts
// Remove rate card context helper
// Remove SOW-specific components
// Add generic document components
```

### **Step 5: Update UI Labels**
Search and replace across codebase:
- "SOW" → "Document"
- "Social Garden" → "[Your App Name]"
- "Brief" → "Context" or "Input"
- "Rate Card" → "Pricing" or remove

### **Step 6: Test & Deploy**
1. Test locally (if possible)
2. Push to GitHub
3. Let EasyPanel rebuild
4. Verify branding changes

---

## 🎯 Recommended Approach

### **Option A: Minimal Rebrand (Fastest - 1-2 hours)**
1. Change colors in `tailwind.config.ts`
2. Update app name in `package.json` and `layout.tsx`
3. Replace favicon
4. Search/replace "Social Garden" → "[New Name]"
5. Delete `/my-tambo-app/`
6. **Keep** all features as-is, just rebranded

### **Option B: Full Generalization (Thorough - 1-2 days)**
1. Do everything in Option A
2. Remove rate card completely
3. Generalize SOW components → Document components
4. Make pricing/fields configurable
5. Remove AUD/GST hardcoding
6. Clean up all Social Garden business logic

### **Option C: Fresh Start (Nuclear - 3-5 days)**
1. Keep only: AI chat, agents, editor, database
2. Remove all SOW/pricing features
3. Build new generic document features from scratch
4. Complete rebrand

---

## 🚀 Quick Start Commands

```bash
# 1. Create a new branch for rebranding
git checkout -b rebrand-generic-app

# 2. Update package.json name
# (Edit manually)

# 3. Delete demo app
rm -rf my-tambo-app/

# 4. Search for "Social Garden" references
grep -r "Social Garden" --include="*.tsx" --include="*.ts" .

# 5. Search for "SOW" references
grep -r "SOW" --include="*.tsx" --include="*.ts" .

# 6. Commit and push
git add .
git commit -m "feat: rebrand to [Your App Name]"
git push origin rebrand-generic-app
```

---

## 📊 Effort Estimation

| Task | Time | Difficulty |
|------|------|------------|
| Choose brand identity | 30 min | Easy |
| Update colors/fonts | 30 min | Easy |
| Update metadata/names | 30 min | Easy |
| Delete demo app | 5 min | Easy |
| Search/replace text | 1 hour | Medium |
| Remove rate card | 2 hours | Medium |
| Generalize components | 4-8 hours | Hard |
| Test everything | 2 hours | Medium |
| **Total (Minimal)** | **2-3 hours** | - |
| **Total (Full)** | **10-15 hours** | - |

---

## ❓ Decision Points

Before starting, decide:

1. **Keep Tambo AI?**
   - ✅ Yes → Keep for generative UI
   - ❌ No → Remove and use basic Vercel AI SDK

2. **Keep SOW features?**
   - ✅ Yes → Generalize them
   - ❌ No → Remove completely

3. **Keep AnythingLLM?**
   - ✅ Yes → Keep knowledge base
   - ❌ No → Remove document upload features

4. **Rebranding depth?**
   - 🟢 Minimal → Just colors/name (2 hours)
   - 🟡 Medium → + Remove Social Garden code (5 hours)
   - 🔴 Full → + Generalize all features (15 hours)

---

## 📞 Next Steps

**Tell me:**
1. What's your new app name?
2. What color scheme do you want? (Choose from options above or provide hex codes)
3. Which rebranding depth? (Minimal/Medium/Full)
4. Keep Tambo AI? Keep SOW features?

Once you decide, I'll help you execute the rebrand! 🚀
