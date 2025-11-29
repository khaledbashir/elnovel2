# Interactive Component Blueprint

This document provides a comprehensive guide to the interactive components currently available in the project and a blueprint for creating new custom components.

## 1. Existing Components

These components are already implemented and registered in `src/lib/tambo.ts`. They can be used immediately by the AI.

### 📊 Graph
**Description:** Renders various types of charts (bar, line, pie) using Recharts.
**Usage:** Ask the AI to "Show a bar chart of sales data" or "Plot a line graph of user growth".
**Schema:**
- `data`: Object containing `type` (bar, line, pie), `labels` (array of strings), and `datasets` (array of data objects).
- `title`: String title for the chart.
- `showLegend`: Boolean.
- `variant`: Visual style (`default`, `solid`, `bordered`).
- `size`: Size of the graph (`default`, `sm`, `lg`).

### 🗂️ DataCard
**Description:** Displays options as clickable cards with links and summaries.
**Usage:** Ask the AI to "Show me 3 options for the project" or "List the available plans".
**Schema:**
- `title`: Title of the card group.
- `items`: Array of objects with `title`, `description`, `url` (optional), and `selected` (boolean).
- `multiSelect`: Boolean to allow selecting multiple items.

### ⚙️ SettingsForm (Demo)
**Description:** A user settings form with personal info, notifications, and preferences.
**Usage:** Ask the AI to "Update my settings to dark mode" or "Turn off email notifications".
**Location:** `src/app/interactables/components/settings-panel.tsx`
**Schema:**
- `name`, `email`: User details.
- `notifications`: Object with `email`, `push`, `sms` booleans.
- `theme`, `language`: Enums for UI preferences.
- `privacy`: Privacy settings booleans.

---

## 2. Blueprint for Custom Components

Follow this step-by-step guide to create a new interactive component.

### Step 1: Define the Zod Schema
Define the data structure your component needs. This schema allows the AI to understand what properties it can modify.

```typescript
import { z } from "zod";

export const myComponentSchema = z.object({
  title: z.string().describe("The title of the component"),
  isActive: z.boolean().describe("Whether the component is active"),
  items: z.array(z.string()).describe("A list of items"),
  // Add more fields as needed
});

export type MyComponentProps = z.infer<typeof myComponentSchema>;
```

### Step 2: Create the React Component
Build your standard React component using the props defined above.

```typescript
import React from "react";

export function MyComponent({ title, isActive, items }: MyComponentProps) {
  return (
    <div className={`p-4 border ${isActive ? "border-blue-500" : "border-gray-200"}`}>
      <h2 className="text-xl font-bold">{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 3: Make it Interactable
Wrap your component with `withInteractable` to enable AI control.

```typescript
import { withInteractable } from "@tambo-ai/react";

export const InteractableMyComponent = withInteractable(MyComponent, {
  componentName: "MyComponent",
  description: "A custom component that displays a list of items and can be toggled active.",
  propsSchema: myComponentSchema,
});
```

### Step 4: Register the Component
Add your component to the `components` array in `src/lib/tambo.ts`.

```typescript
// src/lib/tambo.ts
import { InteractableMyComponent, myComponentSchema } from "@/components/my-component";

export const components: TamboComponent[] = [
  // ... existing components
  {
    name: "MyComponent",
    description: "A custom component that displays a list of items...",
    component: InteractableMyComponent,
    propsSchema: myComponentSchema,
  },
];
```

### Step 5: Use in Application
Use the registered component in your app, or let the AI generate it dynamically.

---

## 3. Example: Interactive Novel Editor (Proposed)

Here is how we plan to implement the **Novel Editor** component.

### Schema
```typescript
const novelEditorSchema = z.object({
  title: z.string().describe("The title of the novel"),
  content: z.string().describe("The Markdown content of the current chapter"),
  chapterId: z.string().describe("The ID of the current chapter"),
  isEditing: z.boolean().describe("Whether the editor is in edit mode"),
});
```

### Implementation Plan
1.  **Component**: Create `src/components/tambo/novel-editor.tsx`.
2.  **Logic**: Integrate the `novel` editor library (Tiptap-based) to handle rich text editing.
3.  **Interaction**: Allow AI to:
    *   "Change the title to 'The Lost City'"
    *   "Append a paragraph about a dark storm"
    *   "Switch to Chapter 2"
4.  **Registration**: Register `NovelEditor` in `src/lib/tambo.ts`.

This blueprint ensures consistency and ease of integration for all future interactive features.
