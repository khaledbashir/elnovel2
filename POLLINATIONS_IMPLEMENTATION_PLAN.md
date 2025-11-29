# Implementation Plan: Pollinations AI Image Generation Integration

## 1. Overview
This document outlines the plan to integrate Pollinations AI for keyless, rapid-prototyping image generation. The system will act as a proxy to `image.pollinations.ai`, adding caching and stability layers.

## 2. Architecture
The system will consist of a backend service acting as a proxy between the client and Pollinations AI.

**Flow:**
`Client -> [Proxy Server (Cache Check)] -> (if miss) -> Pollinations AI -> [Proxy Server (Cache Save)] -> Client`

### Core Components:
1.  **Proxy Endpoint**: Receives prompts and parameters from the frontend.
2.  **Caching Layer**: File-system based caching using SHA1 hashes of the request URL to prevent redundant upstream calls.
3.  **Upstream Client**: Handles requests to Pollinations AI with timeouts and error handling.

## 3. API Design

### Endpoint: `GET /generate`

**Parameters:**
-   `prompt` (required): The image description (e.g., "Cyberpunk city").
-   `size` (optional): Default `1024x1024`.
-   `seed` (optional): Default `123` (for reproducibility).

**Success Response:**
-   Content-Type: `image/png`
-   Body: Binary image data.

**Error Response:**
-   Status: `502 Bad Gateway` (upstream issues) or `400 Bad Request`.
-   Body: JSON `{ "error": "message" }`

## 4. Editor Integration (Frontend)

### Feasibility
The project uses a **Tiptap-based editor** (Novel), making integration highly feasible via a custom Slash Command. The editor structure (`components/tailwind/advanced-editor.tsx` and `slash-command.tsx`) already supports custom commands like YouTube, Twitter, and Image Uploads.

### Recommended Approach: Slash Command
Add a new "Generate Image" item to the slash menu that opens a dialog for the prompt.

**Workflow:**
1.  User types `/image` or `/generate`.
2.  Selects "Generate Image (AI)" from the dropdown.
3.  A dialog opens (similar to the YouTube/Twitter dialogs in `slash-command.tsx`).
4.  User enters a prompt (e.g., "A futuristic city").
5.  Frontend constructs the URL pointing to the proxy: `/api/generate?prompt=...` (or directly to Pollinations if prototyping).
6.  The image is inserted into the editor using the existing `uploadFn` or a new `setImage` command.

### Code Changes Required:
1.  **`components/tailwind/slash-command.tsx`**:
    -   Add `GenerateImageDialog` component (similar to `InputDialog`).
    -   Add new item to `suggestionItems`.
2.  **`components/tailwind/advanced-editor.tsx`**:
    -   Add state for `generateImageOpen`.
    -   Expose setter to `slash-command.tsx`.

## 5. Implementation Options

### Option A: Node.js (Express)
*Recommended for JS/TS based stacks.*

**Dependencies:**
-   `express`: Web server.
-   `node-fetch`: HTTP client.
-   `crypto`: For generating cache keys.

**Key Logic:**
```javascript
// Cache key generation
const src = `https://image.pollinations.ai/prompt/${encodedPrompt}...`;
const key = crypto.createHash("sha1").update(src).digest("hex");
// File check -> Fetch -> Save -> Serve
```

### Option B: Python (FastAPI)
*Recommended for Python/Data/ML stacks.*

**Dependencies:**
-   `fastapi`, `uvicorn`: Web server.
-   `httpx`: Async HTTP client.
-   `hashlib`: For cache keys.

**Key Logic:**
```python
# Cache key generation
src = f"https://image.pollinations.ai/prompt/{encoded_prompt}..."
key = hashlib.sha1(src.encode()).hexdigest()
# File check -> Async Fetch -> Save -> Serve
```

## 6. Development Roadmap

### Phase 1: Backend (Proxy)
1.  Initialize project (Node or Python).
2.  Create `cache/` directory.
3.  Implement `/generate` endpoint with caching.

### Phase 2: Frontend (Editor Integration)
1.  Modify `components/tailwind/slash-command.tsx` to add the "Generate AI Image" command.
2.  Create a UI Dialog for entering the prompt.
3.  Connect the dialog to insert the image URL into the Tiptap editor.

### Phase 3: Deployment & Hardening
1.  **Rate Limiting**: Basic throttle per IP (e.g., 30 req/min).
2.  **Content Safety**: (Optional) Basic keyword filter for prompts.
3.  **CDN**: Place behind Cloudflare/Vercel for edge caching.

## 7. Prompt Engineering Strategy
To ensure high-quality outputs, the application should encourage detailed prompts.

**Prompt Structure:**
-   **Subject**: Clear description.
-   **Style**: "Cinematic", "35mm", "Moebius", etc.
-   **Lighting/Camera**: "Golden hour", "f/2.8".
-   **Negative Prompts**: Append "nologo=true" and avoid "blurry", "text".

**URL Construction Standard:**
`https://image.pollinations.ai/prompt/{PROMPT}?width=1280&height=1024&nologo=true&seed={SEED}`

## 8. Next Steps
- [ ] Select preferred language (Node.js vs Python).
- [ ] Execute scaffolding.
- [ ] Run initial test with `curl`.

## 8. AI System Instructions (Non-Rendering Environments)
*Use this system prompt to configure the AI coder for stability in non-rendering environments.*

> You are now operating in a system that requires specific response formatting to maintain stability and avoid errors. Please adhere to the following guidelines for all responses:
>
> Provide complete, well-structured responses.
> Avoid unexpected metadata or non-standard formatting characters.
> Limit special characters, Unicode symbols, and non-ASCII characters.
> Exclude system messages, tags, or delimiters from your output.
> Start and end your response cleanly without trailing spaces or line breaks.
> Structure paragraphs with standard spacing (single line breaks).
> Properly close all formatting tags if used.
> Keep responses concise and complete.
> When generating images, follow this format:
>
> ! `https://image.pollinations.ai/prompt/{description}?width=1280&height=1024&nologo=true&seed={seed}`
>
> Do NOT include seed parameter unless requested (default to random or specific if asked).
> Image quality settings are mandatory:
> width=1280
> height=1024
> nologo=true
> seed={seed} (if reproducibility is needed)
>
> For URLs:
> Convert spaces to %20
> Remove special characters
> Keep prompts descriptive and detailed
> Include the full parameters string: ?width=1280&height=1024&nologo=true&seed={seed}
>
> Detail prompts by including:
> Subject details
> Setting/background information
> Lighting conditions
> Style keywords
> Mood/atmosphere descriptors
> Effective style keywords include cinematic lighting, hyperrealistic, highly detailed, professional photography, 8k uhd, sharp focus, dramatic lighting, and studio quality.
>
> Example output:
>
> ! `https://image.pollinations.ai/prompt/hyperrealistic%20portrait%20of%20a%20tiger%20in%20jungle,%20dramatic%20lighting,%20cinematic,%20sharp%20focus,%208k%20uhd,%20professional%20photography?width=1280&height=1024&nologo=true&seed=42`
> Here’s your image…
>
> Hyperrealistic portrait of a tiger in the jungle with dramatic lighting.
>
> Remember: Always include width, height, nologo, and seed (if applicable) parameters for best results.

