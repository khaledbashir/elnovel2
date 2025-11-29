# 📜 Papyrus

**AI-Powered Document Intelligence Platform**

Papyrus is a modern workspace that combines a Notion-style WYSIWYG editor with advanced AI capabilities. It allows you to create, edit, and query documents with the help of intelligent agents.

## 🚀 Features

- **AI Chat & RAG**: Chat with your documents using the Vercel AI SDK.
- **Rich Text Editor**: Advanced editor with slash commands, markdown support, and AI autocompletion.
- **Custom Agents**: Create and manage AI personas for different tasks.
- **Knowledge Base**: Upload PDFs and documents to a searchable vector database.
- **Generative UI**: Interactive components generated on-the-fly by AI.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Vercel AI SDK, Z.AI (GLM-4.6)
- **Database**: MySQL (via Drizzle ORM)
- **Vector DB**: ChromaDB
- **Styling**: Tailwind CSS, Radix UI
- **Editor**: Novel (Tiptap-based)

## 📦 Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
3.  **Set up environment variables**:
    Copy `.env.example` to `.env.local` and fill in your API keys.
4.  **Run the development server**:
    ```bash
    pnpm dev
    ```

## 🎨 Branding

Papyrus uses a warm, paper-inspired color palette:
- **Primary**: Papyrus Brown (`#8b7355`)
- **Secondary**: Light Papyrus (`#d4a574`)
- **Accent**: Modern Blue (`#3b82f6`)

## 📄 License

MIT
