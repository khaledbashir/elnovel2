# Agent Builder System

## Overview

The Agent Builder allows you to create custom AI agents with personalized system instructions. Each agent can have its own personality, expertise, and behavior patterns.

## Features

- ✨ **Custom System Instructions**: Define exactly how your AI agent should behave
- 🎨 **Custom Icons**: Choose from 10 emoji icons to represent your agent
- 🎯 **Default Agent**: Set one agent as the default for new conversations
- 📝 **Agent Descriptions**: Add helpful descriptions to remember what each agent does
- 🔄 **Easy Switching**: Quickly switch between agents in the chat interface

## Database Setup

Run the migration to create the agents table:

```bash
# Connect to your MySQL database and run:
mysql -u your_username -p your_database < migrations/create_agents_table.sql
```

Or use your preferred database management tool to execute the SQL in `migrations/create_agents_table.sql`.

## Usage

### 1. Using the Agent Builder UI

The Agent Builder provides a visual interface for managing your agents:

```tsx
import { AgentBuilder } from "@/components/agent-builder";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Agent Builder
      </button>
      
      <AgentBuilder
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

### 2. Using the Agent Selector

Add the agent selector to your chat interface:

```tsx
import { AgentSelector } from "@/components/agent-selector";

function ChatInterface() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  return (
    <>
      <AgentSelector
        selectedAgent={selectedAgent}
        onAgentChange={setSelectedAgent}
        onOpenBuilder={() => setIsBuilderOpen(true)}
      />
      
      <AgentBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
      />
    </>
  );
}
```

### 3. Using the Enhanced Message Thread Panel

Use the pre-built component with agent selector included:

```tsx
import { MessageThreadPanelWithAgents } from "@/components/tambo/message-thread-panel-with-agents";

function ChatPage() {
  return (
    <MessageThreadPanelWithAgents
      contextKey="my-chat"
      showAgentSelector={true}
    />
  );
}
```

## API Endpoints

### GET /api/agents
List all agents

**Response:**
```json
[
  {
    "id": "agent-123",
    "name": "SOW Expert",
    "description": "Specialized in creating SOWs",
    "systemInstructions": "You are a helpful...",
    "isDefault": true,
    "icon": "📝",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/agents
Create a new agent

**Request:**
```json
{
  "name": "Content Writer",
  "description": "Expert in writing blog posts",
  "systemInstructions": "You are a professional content writer...",
  "isDefault": false,
  "icon": "✍️"
}
```

### GET /api/agents/[id]
Get a specific agent

### PUT /api/agents/[id]
Update an agent

**Request:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "systemInstructions": "Updated instructions...",
  "isDefault": true,
  "icon": "🚀"
}
```

### DELETE /api/agents/[id]
Delete an agent

## System Instructions Best Practices

### 1. Be Specific
```
❌ Bad: "You are helpful"
✅ Good: "You are a professional SOW writer who creates detailed, accurate statements of work with proper pricing and deliverables"
```

### 2. Include Language Requirements
```
LANGUAGE REQUIREMENT: You must ALWAYS respond in English. Never use any other language.
```

### 3. Define Behavior Patterns
```
THINKING PROCESS:
1. Analyze the user's request
2. Break it down into actionable steps
3. Provide clear, structured responses
4. Offer relevant suggestions
```

### 4. Specify Expertise
```
EXPERTISE:
- Creating SOW documents
- Calculating budgets with GST
- Recommending roles from rate card
- Structuring deliverables
```

### 5. Set Tone and Style
```
TONE: Professional, helpful, and concise
STYLE: Use bullet points for lists, bold for emphasis
```

## Example Agents

### SOW Expert
```
You are a Helpful assistant specialized in creating professional Statements of Work (SOW) documents.

LANGUAGE REQUIREMENT: You must ALWAYS respond in English.

EXPERTISE:
- Creating detailed SOW documents with accurate pricing
- Understanding client requirements
- Calculating budgets with GST and discounts
- Recommending appropriate roles from the rate card

BEHAVIOR:
- Always ask clarifying questions if requirements are unclear
- Provide 2-3 relevant suggestions after each response
- Structure information clearly with headers and bullet points
```

### Content Writer
```
You are a professional content writer specializing in blog posts and marketing copy.

LANGUAGE REQUIREMENT: You must ALWAYS respond in English.

EXPERTISE:
- Writing engaging blog posts
- Creating compelling marketing copy
- SEO optimization
- Storytelling and narrative structure

TONE: Creative, engaging, and persuasive
STYLE: Use vivid language, metaphors, and storytelling techniques
```

### Code Reviewer
```
You are an experienced software engineer who reviews code for quality and best practices.

LANGUAGE REQUIREMENT: You must ALWAYS respond in English.

EXPERTISE:
- Code quality assessment
- Security vulnerability detection
- Performance optimization
- Best practices and design patterns

BEHAVIOR:
- Provide specific, actionable feedback
- Explain the "why" behind suggestions
- Offer code examples when helpful
```

## How It Works with Tambo

When you select an agent, the system:

1. **Retrieves** the agent's system instructions from the database
2. **Injects** them as the first message in the conversation with `role: "system"`
3. **Tambo AI** uses these instructions to guide its responses
4. **Override** happens on the client side via `initialMessages` prop

This leverages Tambo's "Allow system prompt override" feature, which allows client-side system messages to override the default custom instructions set in the Tambo dashboard.

## Troubleshooting

### Agent not affecting responses
- Ensure "Allow system prompt override" is enabled in Tambo dashboard
- Check that system instructions are being passed in `initialMessages`
- Verify the agent's system instructions are not empty

### Default agent not loading
- Check database connection
- Verify at least one agent has `isDefault: true`
- Check browser console for errors

### Changes not saving
- Verify database permissions
- Check API endpoint responses in Network tab
- Ensure all required fields are filled

## Future Enhancements

- [ ] Agent templates library
- [ ] Import/export agents
- [ ] Agent versioning
- [ ] Usage analytics per agent
- [ ] Collaborative agent sharing
- [ ] Agent testing playground
