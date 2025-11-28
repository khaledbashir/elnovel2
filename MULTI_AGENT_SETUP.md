# Multi-Agent System for Tambo - Setup Guide

## 🤖 What We Built

A complete multi-agent system that lets you:
- **Create custom AI agents** with unique system instructions
- **Switch between agents** dynamically in the chat
- **Set a default agent** that loads automatically
- **Override Tambo's system instructions** per agent using Tambo's built-in feature

---

## 📦 Files Created

### Database
- `/db/migrations/001_agents.sql` - Agents table schema with 3 default agents

### Backend (API)
- `/lib/db/agents.ts` - Database operations (CRUD for agents)
- `/app/api/agents/route.ts` - List & create agents
- `/app/api/agents/[id]/route.ts` - Get, update, delete, set default

### Frontend (UI)
- `/components/agents/agent-selector.tsx` - Dropdown to select active agent
- `/components/agents/agent-builder.tsx` - Full UI to manage agents
- `/components/tambo/message-thread-panel.tsx` - Integrated with agent selector

---

## 🚀 Setup Steps

### Step 1: Run Database Migration

```bash
# If MySQL is in Docker
docker exec -i ahmad_novelsql mysql -u novelsql -pnovelsql novelsql < /elnovel2/db/migrations/001_agents.sql

# OR if MySQL is local
mysql -h 127.0.0.1 -u novelsql -pnovelsql novelsql < db/migrations/001_agents.sql
```

This creates the `agents` table and inserts 3 default agents:
- **SOW Expert** 📄 (default) - Expert at creating SOWs
- **Brainstorm Buddy** 💡 - Creative thinking partner
- **Code Reviewer** 👨‍💻 - Code review expert

### Step 2: Enable System Prompt Override in Tambo

**IMPORTANT:** Go to your Tambo project settings:

1. Visit: **https://tambo.co/dashboard**
2. Select your project (the one with ID `p_OKGBSNDp.60d984`)
3. Go to "**Custom Instructions**" section
4. **Enable** `allowSystemPromptOverride` setting
5. Save changes

This allows the app to send system messages that override the default project instructions.

### Step 3: Restart Dev Server

```bash
cd /elnovel2
pnpm dev
```

### Step 4: Test the Multi-Agent System

1. Open your app: `http://localhost:4546`
2. You should see the **agent selector** at the top of the chat
3. Click the dropdown to switch between agents
4. Click the ⚙️ **Settings icon** to open the Agent Builder
5. Try creating a new agent with custom instructions

---

## 💡 How It Works

### Agent Selection Flow

1. **User selects an agent** from the dropdown
2. App calls `startNewThread()` with `initialMessages`:
   ```typescript
   startNewThread({
     initialMessages: [
       {
         role: "system",
         content: agent.system_instructions
       }
     ]
   });
   ```
3. **Tambo API receives the system message** and overrides the default instructions
4. **AI responds** according to the selected agent's personality/instructions

### Default Agent

- On first load, the app automatically selects the **default agent**
- You can change which agent is default in the Agent Builder
- Click the ⭐ icon to set any agent as default

---

## 🎨 Creating New Agents

### Via UI (Agent Builder)

1. Click the ⚙️ icon in the agent selector
2. Click "**Create New Agent**"
3. Fill in:
   - **Icon**: Choose an emoji (🤖, 💡, 👨‍💻, etc.)
   - **Name**: Agent name (e.g., "Marketing Expert")
   - **Description**: Brief description
   - **System Instructions**: Define how the agent should behave
4. Optionally check "Set as default agent"
5. Click "Create"

### Via API

```bash
curl -X POST http://localhost:4546/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marketing Expert",
    "description": "Expert in digital marketing and strategy",
    "systemInstructions": "You are a marketing expert specializing in digital campaigns...",
    "icon": "📈",
    "isDefault": false
  }'
```

---

## 📝 Example System Instructions

### Product Manager Agent
```
You are an experienced Product Manager. Help users define product requirements, write user stories, prioritize features, and create product roadmaps. Use agile methodologies and best practices.
```

### Sales Coach
```
You are a sales coach and consultant. Help users craft compelling pitches, handle objections, close deals, and build customer relationships. Be encouraging and provide actionable advice.
```

### Legal Advisor
```
You are a legal consultant. Provide guidance on contracts, compliance, intellectual property, and business law. Always include disclaimers that this is not formal legal advice.
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List all agents |
| POST | `/api/agents` | Create new agent |
| GET | `/api/agents/[id]` | Get agent by ID |
| PATCH | `/api/agents/[id]` | Update agent |
| DELETE | `/api/agents/[id]` | Delete agent |
| POST | `/api/agents/[id]/set-default` | Set as default agent |

---

## 🐛 Troubleshooting

### Agent selector not showing
- Check if database migration ran successfully
- Verify agents exist: `SELECT * FROM agents;`
- Check browser console for errors

### System instructions not working
- **Make sure** `allowSystemPromptOverride` is **enabled** in Tambo dashboard
- Check browser console for Tambo API errors
- Verify the agent has `system_instructions` set

### Can't create agents
- Check database connection in `/api/workspaces` test
- Verify MySQL is running
- Check API logs for errors

---

## 🎯 Next Steps

1. **Run the database migration**
2. **Enable system prompt override in Tambo**
3. **Test agent switching** in the UI
4. **Create custom agents** for your specific use cases
5. **Deploy to EasyPanel** (agents will work the same way)

---

## 📚 Resources

- **Tambo System Instruction Override**: https://docs.tambo.co/features/system-instructions
- **Agent Builder UI**: Click ⚙️ in agent selector
- **Database Schema**: `/db/migrations/001_agents.sql`

---

Enjoy your multi-agent system! 🚀✨
