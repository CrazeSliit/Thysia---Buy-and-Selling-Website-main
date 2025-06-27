#!/bin/bash

echo "🔧 Starting Vercel build process..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema (this will create collections if they don't exist)
echo "🗄️ Pushing database schema to MongoDB..."
npx prisma db push --accept-data-loss

# Build Next.js application
echo "🚀 Building Next.js application..."
npm run build

echo "✅ Build process completed!"
