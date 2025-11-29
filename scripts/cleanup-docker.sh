#!/bin/bash

# ============================================
# Docker Cleanup Script - Safe VPS Cleanup
# ============================================
# This script safely cleans up Docker resources to free RAM and disk space
# It will NOT remove running containers or their images

echo "🧹 Starting Docker cleanup..."
echo ""

# Show current disk usage
echo "📊 Current Docker disk usage:"
docker system df
echo ""

# Remove stopped containers
echo "🗑️  Removing stopped containers..."
docker container prune -f

# Remove dangling images (untagged)
echo "🗑️  Removing dangling images..."
docker image prune -f

# Remove unused images (not associated with any container)
echo "🗑️  Removing unused images..."
docker image prune -a -f --filter "until=24h"

# Remove unused volumes
echo "🗑️  Removing unused volumes..."
docker volume prune -f

# Remove unused networks
echo "🗑️  Removing unused networks..."
docker network prune -f

# Remove build cache
echo "🗑️  Removing build cache..."
docker builder prune -f

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 New Docker disk usage:"
docker system df
echo ""
echo "💾 System memory:"
free -h
