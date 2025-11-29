# 🚨 AI INTERACTION GUIDELINES (READ FIRST)

## ⚠️ CRITICAL CONSTRAINTS (BANDWIDTH & RESOURCES)
**The user is on a limited and expensive internet connection.**
1. **NO LOCAL BUILDS:** Never run `npm run build`, `docker build`, or heavy compilation commands locally.
   - **Why?** It wastes bandwidth downloading dependencies and CPU resources.
   - **Alternative:** We use **EasyPanel** for deployment. Push code to GitHub, and let the server build it.
2. **NO HEAVY DOWNLOADS:** Do not install unnecessary packages or download large files/models locally.
3. **EFFICIENT COMMANDS:** Avoid running heavy file scanners or recursive searches that might trigger massive I/O or network activity.

## 🚀 PREFERRED WORKFLOW (PUSH-TO-DEPLOY)
1. **Edit Code:** Make necessary changes to the codebase.
2. **Push:** `git add . && git commit -m "fix: ..." && git push origin main`
3. **Deploy:** Let EasyPanel detect the commit and build on the remote server.

## 🛠️ PROJECT CONTEXT
- **Stack:** Next.js 14+, Tailwind CSS, Vercel AI SDK.
- **Deployment:** EasyPanel (VPS).
- **Database:** MySQL (hosted on VPS).
- **AI Provider:** Z.AI (via Vercel SDK).

## 🧠 "CHILL MODE" PROTOCOL
- **Don't Over-Engineer:** Fix the specific problem asked. Don't refactor the whole app unless asked.
- **Don't Panic:** If a build fails remotely, analyze the logs. Don't try to reproduce it locally by downloading the world.
- **Ask First:** Before running any command that might take >1 minute or use >100MB data, **ASK THE USER**.

---
*Copy this context for any new AI session to ensure they respect your constraints.*
