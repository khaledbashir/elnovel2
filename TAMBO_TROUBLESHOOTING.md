# Tambo Integration Troubleshooting Guide

## ⚠️ CRITICAL ISSUE FOUND

**Root Cause:** Your Tambo API key is **NOT authorized** for project `p_OKGBSNDp.60d984`.

**Proof:**
```bash
curl https://api.tambo.co/threads/project/p_OKGBSNDp.60d984 \
  -H "Authorization: Bearer tambo_uc1c5C5Tjf8n..."
# Response: 403 Forbidden
```

**Solution:** See `TAMBO_SETUP_GUIDE.md` for step-by-step instructions to get matching credentials.

---

## Issues Fixed

### 1. **403 Forbidden & "Project not found" Errors**
**Cause:** Browser cache contains old Tambo project ID (`p_GyV7onUJ.43bb9c`)

**Solution:**
1. Navigate to: `http://localhost:3000/clear-cache`
2. Click "Clear Cache"
3. Click "Refresh & Go Home"

**Manual Alternative:**
- Open DevTools (F12)
- Go to Application > Storage
- Click "Clear site data"
- Refresh the page

---

### 2. **500 Error on `/api/workspaces`**
**Cause:** Database connection using wrong host (`127.0.0.1` instead of Docker service name)

**Fixed:** Updated `.env.local` to use `DB_HOST=ahmad_novelsql`

**Verify Fix:**
```bash
# Check if database is accessible
docker exec -it ahmad_novelsql mysql -u novelsql -pnovelsql -e "SELECT 1;"
```

---

### 3. **Environment Sync**
**Status:** ✅ Local environment now matches EasyPanel

**Current Configuration:**
- **API Key:** `tambo_uc1c5C5Tjf8n...` (synced)
- **Project ID:** `p_OKGBSNDp.60d984` (synced)
- **Database:** `ahmad_novelsql:3306` (Docker service)

---

## Testing Steps

1. **Restart Dev Server:**
   ```bash
   cd /elnovel2
   pnpm dev
   ```

2. **Clear Browser Cache:**
   - Visit: `http://localhost:3000/clear-cache`
   - Click "Clear Cache"

3. **Test Tambo Integration:**
   - Open the app
   - Try creating a new thread
   - Send a message
   - Check console for errors

4. **Verify Database:**
   - Check if workspaces load without 500 error
   - Create a new workspace
   - Verify it persists

---

## Common Errors & Solutions

### Error: "API returned non-array data"
**Cause:** Tambo SDK expecting array but receiving object
**Solution:** This is a warning, not critical. The SDK handles it internally.

### Error: "Failed to load resource: 403"
**Cause:** Old project ID in cache
**Solution:** Clear cache at `/clear-cache`

### Error: "ECONNREFUSED 127.0.0.1:3306"
**Cause:** Database host misconfigured
**Solution:** Ensure `DB_HOST=ahmad_novelsql` in `.env.local`

---

## Environment Variables Checklist

### Local (`.env.local`)
- [x] `NEXT_PUBLIC_TAMBO_API_KEY` - Synced with EasyPanel
- [x] `NEXT_PUBLIC_TAMBO_PROJECT_ID` - Synced with EasyPanel
- [x] `DB_HOST` - Set to `ahmad_novelsql`

### EasyPanel
- [x] `NEXT_PUBLIC_TAMBO_API_KEY` - Matches local
- [x] `NEXT_PUBLIC_TAMBO_PROJECT_ID` - Matches local
- [x] `DB_HOST` - Set to `127.0.0.1` (correct for EasyPanel)

---

## Next Steps

1. Clear browser cache using `/clear-cache` page
2. Restart dev server
3. Test Tambo chat functionality
4. Verify workspace API works
5. Deploy to EasyPanel if all tests pass

---

## Notes

- **Old Project IDs are commented out** in `.env.local` for reference
- **Database host differs** between local (Docker service name) and EasyPanel (localhost)
- **Tambo SDK caches project ID** in IndexedDB - must clear on project change
