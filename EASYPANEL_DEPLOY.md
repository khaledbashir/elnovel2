# EasyPanel Deployment Guide

## ✅ Working Locally - Now Deploy to EasyPanel

Since your app is working locally with `pnpm dev`, you just need to sync the environment variables to EasyPanel.

---

## Step 1: Copy Your Working Local Credentials

Your working credentials from `.env.local`:

```bash
# Copy these exact values to EasyPanel
NEXT_PUBLIC_TAMBO_API_KEY=tambo_uc1c5C5Tjf8n/EuLfhPQjJ0pkdlrOZ7Rl+TkKCfhAH9tPmPEVKyV/e8ElAmbrLbazzx/d7xPsenWP1WKfusyZnpbuCons8SJo2ehBSm+gyY=
NEXT_PUBLIC_TAMBO_PROJECT_ID=p_OKGBSNDp.60d984
NEXT_PUBLIC_TAMBO_URL=https://api.tambo.co
```

---

## Step 2: Update EasyPanel Environment Variables

1. **Log into EasyPanel**
   - Go to your EasyPanel dashboard

2. **Select Your App**
   - Find your Novel/SOW Workbench app

3. **Go to Environment Variables**
   - Click on "Environment" or "Settings" tab
   - Find the "Environment Variables" section

4. **Update These Variables:**

   ```bash
   # Tambo Configuration (REQUIRED)
   NEXT_PUBLIC_TAMBO_API_KEY=tambo_uc1c5C5Tjf8n/EuLfhPQjJ0pkdlrOZ7Rl+TkKCfhAH9tPmPEVKyV/e8ElAmbrLbazzx/d7xPsenWP1WKfusyZnpbuCons8SJo2ehBSm+gyY=
   NEXT_PUBLIC_TAMBO_PROJECT_ID=p_OKGBSNDp.60d984
   NEXT_PUBLIC_TAMBO_URL=https://api.tambo.co
   
   # Z.AI Configuration
   ZAI_API_KEY=08479f01709a43f0af5d7a7490e3bb55.QUKmWD8Zv2iq9OvB
   ZAI_API_URL=https://api.z.ai/api/coding/paas/v4
   
   # Database Configuration (EasyPanel uses localhost)
   DATABASE_URL=mysql://novelsql:novelsql@ahmad_novelsql:3306/novelsql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=novelsql
   DB_PASSWORD=novelsql
   DB_NAME=novelsql
   
   # AnythingLLM Configuration
   ANYTHING_LLM_URL=https://ahmad-anything-llm.840tjq.easypanel.host/api
   ANYTHING_LLM_API_KEY=0G0WTZ3-6ZX4D20-H35VBRG-9059WPA
   ANYTHING_LLM_WORKSPACE_SLUG=novel
   
   # Optional
   NEXT_PUBLIC_DOCS_URL=https://docs.tambo.co
   ```

5. **Save Changes**

---

## Step 3: Redeploy the App

After updating environment variables:

1. **Trigger a Rebuild**
   - In EasyPanel, click "Rebuild" or "Redeploy"
   - OR push a commit to trigger auto-deployment

2. **Wait for Deployment**
   - Monitor the build logs
   - Wait for the app to restart

---

## Step 4: Clear Browser Cache (Production)

Once deployed:

1. **Visit your production URL**
   - Example: `https://your-app.easypanel.host`

2. **Clear cache page**
   - Go to: `https://your-app.easypanel.host/clear-cache`
   - Click "Clear Cache"
   - Refresh

3. **Test Tambo Chat**
   - Try sending a message
   - Verify no 403 errors in console

---

## 🔍 Verify Deployment

### Check Environment Variables Are Set

In EasyPanel, you can usually see the environment variables in the app settings. Verify:

- ✅ `NEXT_PUBLIC_TAMBO_API_KEY` is set
- ✅ `NEXT_PUBLIC_TAMBO_PROJECT_ID` is set
- ✅ Both match your local working values

### Check Build Logs

Look for these in the build logs:

```
✓ Compiled successfully
✓ Ready in Xms
```

### Check Runtime Logs

After deployment, check runtime logs for:

- ❌ No "Tambo API key not found" warnings
- ❌ No "Tambo Project ID not found" warnings
- ❌ No 403 errors from Tambo API

---

## 🐛 Troubleshooting EasyPanel

### Issue: Still Getting 403 Errors

**Cause:** Environment variables not loaded or browser cache

**Fix:**
1. Verify env vars are set in EasyPanel dashboard
2. Rebuild the app (don't just restart)
3. Clear browser cache at `/clear-cache`
4. Hard refresh (Ctrl+Shift+R)

### Issue: Database Connection Errors

**Cause:** Wrong DB_HOST for EasyPanel

**Fix:**
- EasyPanel uses `DB_HOST=127.0.0.1` (NOT `ahmad_novelsql`)
- Verify your database service is running
- Check database credentials match

### Issue: Build Fails

**Cause:** Missing dependencies or TypeScript errors

**Fix:**
```bash
# Test build locally first
cd /elnovel2
pnpm build

# If it passes, push to trigger EasyPanel rebuild
git add .
git commit -m "Update Tambo credentials"
git push
```

---

## 📋 Quick Checklist

- [ ] Copy working credentials from `.env.local`
- [ ] Update EasyPanel environment variables
- [ ] Rebuild/redeploy the app
- [ ] Wait for deployment to complete
- [ ] Visit production URL
- [ ] Clear cache at `/clear-cache`
- [ ] Test Tambo chat functionality
- [ ] Verify no console errors

---

## 🎯 Key Differences: Local vs EasyPanel

| Setting | Local | EasyPanel |
|---------|-------|-----------|
| DB_HOST | `ahmad_novelsql` | `127.0.0.1` |
| Tambo API Key | Same | Same |
| Tambo Project ID | Same | Same |
| Cache Clearing | `localhost:3000/clear-cache` | `your-app.host/clear-cache` |

---

## 💡 Pro Tips

1. **Always test locally first** with `pnpm build` before deploying
2. **Use the same credentials** in both environments
3. **Clear browser cache** after every deployment
4. **Check build logs** if something doesn't work
5. **Keep old credentials commented** in case you need to rollback

---

## 🆘 Need Help?

If it's still not working on EasyPanel:

1. Check EasyPanel build logs for errors
2. Check EasyPanel runtime logs for 403 errors
3. Verify environment variables are actually set
4. Try rebuilding (not just restarting)
5. Clear browser cache and try incognito mode

The app should work exactly the same as local once the env vars are synced! 🚀
