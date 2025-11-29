#!/bin/bash

echo "🐳 Starting Safe Docker Cleanup..."

# 1. Prune Build Cache (Safe and most effective for build servers)
# This removes build cache that is not currently in use.
echo "🧹 Cleaning Docker Build Cache..."
docker builder prune -f

# 2. Prune Dangling Images
# This removes images that are not tagged and not used by any container.
# These are typically intermediate build layers that are no longer needed.
echo "🧹 Cleaning Dangling Images..."
docker image prune -f

# OPTIONAL: Remove stopped containers (Uncomment if you want this)
# echo "🧹 Removing stopped containers..."
# docker container prune -f

echo "✅ Cleanup Complete!"
echo "--------------------------------"
echo "Current Docker Disk Usage:"
docker system df
