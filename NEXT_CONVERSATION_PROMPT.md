# PROMPT FOR NEXT CONVERSATION - Complete Tambo Components Setup

## 🧪 Build Test Results

**Last Test:** Build failed with missing component errors

**Current Build Errors:**
```
Module not found: Can't resolve '@/components/tambo/message-input'
Module not found: Can't resolve '@/components/tambo/thread-history'
Module not found: Can't resolve '@/components/tambo/message'
```

**Status:** Application will not compile until all missing components are copied.

---

## Current Status

✅ **COMPLETED:**
- `MessageThreadPanel` component copied and integrated
- `app/page.tsx` updated to use official `MessageThreadPanel` component
- Custom `simple-chat.tsx` removed
- Supporting components copied:
  - `thread-hooks.ts` - Utility hooks
  - `suggestions-tooltip.tsx`
  - `message-generation-stage.tsx`
  - `scrollable-message-container.tsx`
  - `message-suggestions.tsx`
  - `thread-content.tsx`
  - `message-thread-full.tsx`
  - `message-thread-panel.tsx`

## What Still Needs to Be Done

### Critical Missing Components (Required for MessageThreadPanel to work)

The application **will not compile** until these components are copied:

1. **`message.tsx`** (~830 lines)
   - Location: `/novel-tambo-poc/tambo/cli/src/registry/message/message.tsx`
   - Copy to: `/novel-tambo-poc/novel/apps/web/components/tambo/message.tsx`
   - **Dependencies:** Requires `markdown-components.tsx`

2. **`markdown-components.tsx`** (~260 lines)
   - Location: `/novel-tambo-poc/tambo/cli/src/registry/message/markdown-components.tsx`
   - Copy to: `/novel-tambo-poc/novel/apps/web/components/tambo/markdown-components.tsx`
   - **Dependencies:** `streamdown`, `dompurify`, `highlight.js` (already installed)

3. **`message-input.tsx`** (~1080 lines)
   - Location: `/novel-tambo-poc/tambo/cli/src/registry/message-input/message-input.tsx`
   - Copy to: `/novel-tambo-poc/novel/apps/web/components/tambo/message-input.tsx`
   - **Dependencies:** `dictation-button.tsx`, `mcp-config-modal.tsx`, `mcp-components.tsx`, `elicitation-ui.tsx`

4. **`thread-container.tsx`** (~100 lines)
   - Location: `/novel-tambo-poc/tambo/cli/src/registry/message-thread-full/thread-container.tsx`
   - Copy to: `/novel-tambo-poc/novel/apps/web/components/tambo/thread-container.tsx`

5. **`thread-history.tsx`** (~660 lines)
   - Location: `/novel-tambo-poc/tambo/cli/src/registry/thread-history/thread-history.tsx`
   - Copy to: `/novel-tambo-poc/novel/apps/web/components/tambo/thread-history.tsx`

### Supporting Components (Required for full features)

6. **`dictation-button.tsx`** (~70 lines)
   - Location: `/novel-tambo-poc/tambo/cli/src/registry/message-input/dictation-button.tsx`
   - Copy to: `/novel-tambo-poc/novel/apps/web/components/tambo/dictation-button.tsx`
   - **Note:** Needs SSR fix - use `dynamic` import with `ssr: false`

7. **`mcp-config-modal.tsx`** (~550 lines)
   - Location: `/novel-tambo-poc/tambo/cli/src/registry/message-input/mcp-config-modal.tsx`
   - Copy to: `/novel-tambo-poc/novel/apps/web/components/tambo/mcp-config-modal.tsx`
   - **Dependencies:** `framer-motion`

8. **`mcp-components.tsx`** (~360 lines)
   - Location: `/novel-tambo-poc/tambo/cli/src/registry/mcp-components/mcp-components.tsx`
   - Copy to: `/novel-tambo-poc/novel/apps/web/components/tambo/mcp-components.tsx`

9. **`elicitation-ui.tsx`** (~620 lines)
   - Location: `/novel-tambo-poc/tambo/cli/src/registry/elicitation-ui/elicitation-ui.tsx`
   - Copy to: `/novel-tambo-poc/novel/apps/web/components/tambo/elicitation-ui.tsx`

## Dependencies to Install

**Status:** Dependencies are NOT installed (verified via `npm list`)

**Required Dependencies:**
```bash
cd /novel-tambo-poc/novel/apps/web
npm install streamdown dompurify framer-motion @radix-ui/react-tooltip @radix-ui/react-dropdown-menu
npm install --save-dev @types/dompurify
```

**Note:** The project uses a monorepo. If npm doesn't work, try:
```bash
pnpm add streamdown dompurify framer-motion @radix-ui/react-tooltip @radix-ui/react-dropdown-menu
pnpm add -D @types/dompurify
```

**Already Installed (from package.json):**
- `highlight.js` ✅
- `@radix-ui/react-dialog` ✅
- `@radix-ui/react-popover` ✅
- `@radix-ui/react-scroll-area` ✅
- `@radix-ui/react-select` ✅
- `lucide-react` ✅
- `class-variance-authority` ✅

## Import Path Adjustments

All components in the CLI registry use `@/components/tambo/...` imports, which matches our structure. However, verify these imports are correct:

- `@/components/tambo/message` ✅
- `@/components/tambo/message-input` ✅
- `@/components/tambo/message-suggestions` ✅
- `@/components/tambo/thread-content` ✅
- `@/components/tambo/thread-container` ⏳ (needs to be copied)
- `@/components/tambo/thread-history` ⏳ (needs to be copied)
- `@/components/tambo/scrollable-message-container` ✅
- `@/lib/thread-hooks` ✅
- `@/lib/utils` ✅

## Current Application Structure

```
/novel-tambo-poc/novel/apps/web/
├── app/
│   ├── page.tsx                    ✅ Uses MessageThreadPanel
│   └── providers.tsx               ✅ TamboProvider configured
├── components/
│   └── tambo/
│       ├── message-generation-stage.tsx     ✅
│       ├── message-suggestions.tsx          ✅
│       ├── message-thread-full.tsx          ✅
│       ├── message-thread-panel.tsx         ✅
│       ├── scrollable-message-container.tsx ✅
│       ├── suggestions-tooltip.tsx          ✅
│       └── thread-content.tsx               ✅
├── lib/
│   ├── tambo/
│   │   └── setup.ts                ✅ PricingTable registered
│   └── thread-hooks.ts             ✅
└── styles/
    └── globals.css                 ✅ Colors defined
```

## Step-by-Step Instructions for Next Conversation

### Step 1: Install Dependencies First
```bash
cd /novel-tambo-poc/novel/apps/web
npm install streamdown dompurify framer-motion @radix-ui/react-tooltip @radix-ui/react-dropdown-menu
npm install --save-dev @types/dompurify
```

### Step 2: Copy Components in Dependency Order

**Phase 1: Core Message Components (Copy these first)**
1. Copy `markdown-components.tsx` 
   - From: `/novel-tambo-poc/tambo/cli/src/registry/message/markdown-components.tsx`
   - To: `/novel-tambo-poc/novel/apps/web/components/tambo/markdown-components.tsx`
   - **Why first:** Required by `message.tsx`

2. Copy `message.tsx`
   - From: `/novel-tambo-poc/tambo/cli/src/registry/message/message.tsx`
   - To: `/novel-tambo-poc/novel/apps/web/components/tambo/message.tsx`
   - **Why second:** Required by `thread-content.tsx`

**Phase 2: Message Input Dependencies (Copy before message-input.tsx)**
3. Copy `dictation-button.tsx`
   - From: `/novel-tambo-poc/tambo/cli/src/registry/message-input/dictation-button.tsx`
   - To: `/novel-tambo-poc/novel/apps/web/components/tambo/dictation-button.tsx`
   - **Note:** Already uses `dynamic` import with `ssr: false` ✅

4. Copy `mcp-components.tsx`
   - From: `/novel-tambo-poc/tambo/cli/src/registry/mcp-components/mcp-components.tsx`
   - To: `/novel-tambo-poc/novel/apps/web/components/tambo/mcp-components.tsx`
   - **Why:** Required by `message-input.tsx`

5. Copy `mcp-config-modal.tsx`
   - From: `/novel-tambo-poc/tambo/cli/src/registry/message-input/mcp-config-modal.tsx`
   - To: `/novel-tambo-poc/novel/apps/web/components/tambo/mcp-config-modal.tsx`
   - **Why:** Required by `message-input.tsx`

6. Copy `elicitation-ui.tsx`
   - From: `/novel-tambo-poc/tambo/cli/src/registry/elicitation-ui/elicitation-ui.tsx`
   - To: `/novel-tambo-poc/novel/apps/web/components/tambo/elicitation-ui.tsx`
   - **Why:** Required by `message-input.tsx`

**Phase 3: Main Components**
7. Copy `message-input.tsx`
   - From: `/novel-tambo-poc/tambo/cli/src/registry/message-input/message-input.tsx`
   - To: `/novel-tambo-poc/novel/apps/web/components/tambo/message-input.tsx`
   - **Why:** Required by `message-thread-panel.tsx`

8. Copy `thread-container.tsx`
   - From: `/novel-tambo-poc/tambo/cli/src/registry/message-thread-full/thread-container.tsx`
   - To: `/novel-tambo-poc/novel/apps/web/components/tambo/thread-container.tsx`
   - **Why:** Required by `message-thread-full.tsx`

9. Copy `thread-history.tsx`
   - From: `/novel-tambo-poc/tambo/cli/src/registry/thread-history/thread-history.tsx`
   - To: `/novel-tambo-poc/novel/apps/web/components/tambo/thread-history.tsx`
   - **Why:** Required by `message-thread-panel.tsx`

### Step 3: Copy Index Files (Required for proper exports)

**Important:** Each component registry has an `index.tsx` file that exports the components. Copy these as well:

10. Copy `message/index.tsx`
    - From: `/novel-tambo-poc/tambo/cli/src/registry/message/index.tsx`
    - To: `/novel-tambo-poc/novel/apps/web/components/tambo/message/index.tsx`
    - **Exports:** `Message`, `MessageContent`, `MessageRenderedComponentArea`, `messageVariants`, `ToolcallInfo`

11. Copy `message-input/index.tsx`
    - From: `/novel-tambo-poc/tambo/cli/src/registry/message-input/index.tsx`
    - To: `/novel-tambo-poc/novel/apps/web/components/tambo/message-input/index.tsx`
    - **Exports:** `MessageInput`, `MessageInputError`, `MessageInputSubmitButton`, `MessageInputTextarea`, `MessageInputToolbar`, `messageInputVariants`

12. Copy `thread-history/index.tsx`
    - From: `/novel-tambo-poc/tambo/cli/src/registry/thread-history/index.tsx`
    - To: `/novel-tambo-poc/novel/apps/web/components/tambo/thread-history/index.tsx`
    - **Exports:** `ThreadHistory`, `ThreadHistoryHeader`, `ThreadHistoryNewButton`, `ThreadHistorySearch`, `ThreadHistoryList`

13. Copy `mcp-components/index.tsx`
    - From: `/novel-tambo-poc/tambo/cli/src/registry/mcp-components/index.tsx`
    - To: `/novel-tambo-poc/novel/apps/web/components/tambo/mcp-components/index.tsx`
    - **Exports:** `McpPromptButton`, `McpResourceButton` (and types)

14. Copy `elicitation-ui/index.tsx`
    - From: `/novel-tambo-poc/tambo/cli/src/registry/elicitation-ui/index.tsx`
    - To: `/novel-tambo-poc/novel/apps/web/components/tambo/elicitation-ui/index.tsx`
    - **Exports:** `ElicitationUI` (and types)

### Step 4: Verify Import Paths

All components should use:
- `@/components/tambo/...` for component imports
- `@/lib/...` for utility imports
- `@tambo-ai/react` only for hooks (not UI components)

### Step 5: Test the Build

```bash
cd /novel-tambo-poc/novel/apps/web
npm run build
```

**Expected:** Build should succeed with no module resolution errors.

### Step 6: Test the Application

```bash
npm run dev
```

**Verify:**
- ✅ Application starts without errors
- ✅ MessageThreadPanel appears on the right side
- ✅ Thread history sidebar is visible
- ✅ Message input field is functional
- ✅ Can send messages
- ✅ AI responses display correctly

## Expected Errors & Solutions

### Current Build Errors (Before Component Copy)

**Error 1:**
```
Module not found: Can't resolve '@/components/tambo/message-input'
```
**Solution:** Copy `message-input.tsx` and all its dependencies (dictation-button, mcp-components, mcp-config-modal, elicitation-ui)

**Error 2:**
```
Module not found: Can't resolve '@/components/tambo/thread-history'
```
**Solution:** Copy `thread-history.tsx` from `/tambo/cli/src/registry/thread-history/thread-history.tsx`

**Error 3:**
```
Module not found: Can't resolve '@/components/tambo/message'
```
**Solution:** Copy `message.tsx` and `markdown-components.tsx` (message depends on markdown-components)

### Potential Errors After Copying

**Error: Missing dependencies**
```
Cannot find module 'streamdown' or its corresponding type declarations
```
**Solution:** Run `npm install streamdown dompurify framer-motion @radix-ui/react-tooltip @radix-ui/react-dropdown-menu`

**Error: SSR issues with dictation-button**
```
ReferenceError: window is not defined
```
**Solution:** `dictation-button.tsx` already uses `dynamic` import with `ssr: false` in the source, so this should be fine. If issues persist, verify the import in `message-input.tsx`.

**Error: Missing exports**
```
Attempted import error: 'MessageInput' is not exported from '@/components/tambo/message-input'
```
**Solution:** Check if `message-input/index.tsx` exists and exports all required components. If not, create it or verify the component file exports correctly.

## Important Notes

- **DO NOT** create custom components - only copy from the official CLI registry
- **DO NOT** modify the official component code except for:
  - Import paths (if needed)
  - SSR fixes (for dictation-button)
- **ONLY** customizations allowed:
  - Colors via CSS variables (already done)
  - PricingTable component registration (already done)
- All components should be copied **exactly** as they appear in the CLI registry
- Adjust import paths to match the project structure (`@/components/tambo/...`)

## Reference Files

- CLI Registry: `/novel-tambo-poc/tambo/cli/src/registry/`
- Showcase Examples: `/novel-tambo-poc/tambo/showcase/src/components/ui/`
- Current App: `/novel-tambo-poc/novel/apps/web/`

## Success Criteria

The application should:
- ✅ Compile without errors
- ✅ Display the MessageThreadPanel on the right side
- ✅ Show thread history sidebar
- ✅ Allow sending messages
- ✅ Display AI responses
- ✅ Support file attachments
- ✅ Show message suggestions
- ✅ Work with the PricingTable component when AI generates it

---

---

## 📋 Quick Reference Checklist

Copy components in this exact order:

- [ ] **Step 1:** Install dependencies (`streamdown`, `dompurify`, `framer-motion`, etc.)
- [ ] **Step 2:** Copy `markdown-components.tsx`
- [ ] **Step 3:** Copy `message.tsx`
- [ ] **Step 4:** Copy `dictation-button.tsx`
- [ ] **Step 5:** Copy `mcp-components.tsx`
- [ ] **Step 6:** Copy `mcp-config-modal.tsx`
- [ ] **Step 7:** Copy `elicitation-ui.tsx`
- [ ] **Step 8:** Copy `message-input.tsx`
- [ ] **Step 9:** Copy `thread-container.tsx`
- [ ] **Step 10:** Copy `thread-history.tsx`
- [ ] **Step 11:** Copy `message/index.tsx`
- [ ] **Step 12:** Copy `message-input/index.tsx`
- [ ] **Step 13:** Copy `thread-history/index.tsx`
- [ ] **Step 14:** Copy `mcp-components/index.tsx`
- [ ] **Step 15:** Copy `elicitation-ui/index.tsx`
- [ ] **Step 16:** Run `npm run build` to verify
- [ ] **Step 17:** Run `npm run dev` to test

---

**Last Updated:** After build testing and error analysis
**Status:** Components partially copied, 9 components remaining + dependencies need installation
**Build Status:** ❌ Failing (missing components)

