# Tambo Setup Guide - CRITICAL FIX NEEDED

## 🔴 CONFIRMED ISSUE

Your API key is **NOT authorized** for project `p_OKGBSNDp.60d984`.

**API Test Result:**
```bash
curl https://api.tambo.co/threads/project/p_OKGBSNDp.60d984
Response: {"message":"Forbidden resource","error":"Forbidden","statusCode":403}
```

---

## ✅ SOLUTION: Get Matching API Key & Project ID

You need to go to the Tambo dashboard and ensure the API key and Project ID are from the **same project**.

### Step 1: Visit Tambo Dashboard
1. Go to: **https://tambo.co/dashboard** (or https://app.tambo.co)
2. Log in with your account

### Step 2: Create or Select a Project
1. Either create a new project OR select your existing "SOW Workbench" project
2. **IMPORTANT:** Make sure you're in the correct project

### Step 3: Get the API Key
1. In the project settings, find the **API Key** section
2. Copy the API key (starts with `tambo_...`)
3. **This key MUST be from the same project as the Project ID**

### Step 4: Get the Project ID
1. In the same project, find the **Project ID** (format: `p_XXXXXXXX.XXXXXX`)
2. Copy this ID
3. **Verify it matches the project where you got the API key**

### Step 5: Update Environment Variables

**For Local Development** (`.env.local`):
```bash
NEXT_PUBLIC_TAMBO_API_KEY=tambo_YOUR_NEW_KEY_HERE
NEXT_PUBLIC_TAMBO_PROJECT_ID=p_YOUR_PROJECT_ID_HERE
```

**For EasyPanel** (Environment Variables):
```bash
NEXT_PUBLIC_TAMBO_API_KEY=tambo_YOUR_NEW_KEY_HERE
NEXT_PUBLIC_TAMBO_PROJECT_ID=p_YOUR_PROJECT_ID_HERE
```

**⚠️ CRITICAL:** Both must be from the SAME project!

### Step 6: Clear Browser Cache
1. Visit: `http://localhost:3000/clear-cache`
2. Click "Clear Cache"
3. Refresh the page

### Step 7: Restart Dev Server
```bash
cd /elnovel2
pkill -f "next dev"
pnpm dev
```

---

## 🔍 How to Verify It's Working

Test the API key manually:
```bash
# Replace with YOUR actual API key and Project ID
curl -s "https://api.tambo.co/threads/project/YOUR_PROJECT_ID" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response:**
- Status: `200` (success)
- Body: `[]` or list of threads

**If you still get 403:**
- The API key and Project ID don't match
- Go back to the dashboard and verify they're from the same project

---

## 📝 Current Configuration (BROKEN)

**Local `.env.local`:**
- API Key: `tambo_uc1c5C5Tjf8n...` 
- Project ID: `p_OKGBSNDp.60d984`
- **Status:** ❌ 403 Forbidden (key doesn't have access to this project)

**EasyPanel:**
- API Key: `tambo_uc1c5C5Tjf8n...`
- Project ID: `p_OKGBSNDp.60d984`
- **Status:** ❌ Same issue as local

---

## 🎯 Quick Fix Checklist

- [ ] Log into Tambo dashboard
- [ ] Create/select the correct project
- [ ] Copy API key from that project
- [ ] Copy Project ID from that same project
- [ ] Update `.env.local` with both values
- [ ] Update EasyPanel env vars with both values
- [ ] Clear browser cache at `/clear-cache`
- [ ] Restart dev server
- [ ] Test with curl command above
- [ ] Verify app works

---

## 🤔 Why This Happened

Tambo projects are isolated. Each project has its own:
- API Key (for authentication)
- Project ID (for identifying the project)
- Threads (chat conversations)

If you use an API key from Project A with the Project ID from Project B, you'll get a 403 Forbidden error.

**The fix:** Make sure both come from the same project in the Tambo dashboard.
