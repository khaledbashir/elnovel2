#!/bin/bash

# Tambo API Key & Project ID Verification Script
# Usage: ./verify-tambo.sh

echo "🔍 Tambo Credentials Verification"
echo "=================================="
echo ""

# Load from .env.local
if [ -f .env.local ]; then
    export $(cat .env.local | grep -E "NEXT_PUBLIC_TAMBO" | xargs)
else
    echo "❌ .env.local not found!"
    exit 1
fi

# Check if variables are set
if [ -z "$NEXT_PUBLIC_TAMBO_API_KEY" ]; then
    echo "❌ NEXT_PUBLIC_TAMBO_API_KEY not set in .env.local"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_TAMBO_PROJECT_ID" ]; then
    echo "❌ NEXT_PUBLIC_TAMBO_PROJECT_ID not set in .env.local"
    exit 1
fi

echo "📋 Configuration:"
echo "  API Key: ${NEXT_PUBLIC_TAMBO_API_KEY:0:20}..."
echo "  Project ID: $NEXT_PUBLIC_TAMBO_PROJECT_ID"
echo ""

echo "🧪 Testing API connection..."
echo ""

# Test the API
RESPONSE=$(curl -s -w "\n%{http_code}" \
    "https://api.tambo.co/threads/project/$NEXT_PUBLIC_TAMBO_PROJECT_ID?contextKey=test" \
    -H "Authorization: Bearer $NEXT_PUBLIC_TAMBO_API_KEY" \
    -H "Content-Type: application/json")

# Extract status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"
echo ""

# Check result
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS! Your Tambo credentials are valid!"
    echo ""
    echo "Next steps:"
    echo "  1. Clear browser cache: http://localhost:3000/clear-cache"
    echo "  2. Restart dev server: pnpm dev"
    echo "  3. Test the chat interface"
elif [ "$HTTP_CODE" = "403" ]; then
    echo "❌ FAILED: 403 Forbidden"
    echo ""
    echo "This means your API key doesn't have access to this project."
    echo ""
    echo "Fix:"
    echo "  1. Go to https://tambo.co/dashboard"
    echo "  2. Make sure you're in the correct project"
    echo "  3. Copy BOTH the API key AND project ID from the SAME project"
    echo "  4. Update .env.local with the new values"
    echo "  5. Run this script again"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ FAILED: 401 Unauthorized"
    echo ""
    echo "This means your API key is invalid or expired."
    echo ""
    echo "Fix:"
    echo "  1. Go to https://tambo.co/dashboard"
    echo "  2. Generate a new API key"
    echo "  3. Update NEXT_PUBLIC_TAMBO_API_KEY in .env.local"
    echo "  4. Run this script again"
else
    echo "❌ FAILED: Unexpected error (HTTP $HTTP_CODE)"
    echo ""
    echo "Check the response above for details."
fi

echo ""
echo "For detailed setup instructions, see: TAMBO_SETUP_GUIDE.md"
