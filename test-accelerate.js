#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Simple test to check if Prisma Client can be created with Accelerate URL
console.log('🔍 Testing Prisma Accelerate connection...');

try {
  // Check if environment variable is set
  const databaseUrl = process.env.DATABASE_URL;
  console.log('✅ DATABASE_URL is set:', databaseUrl ? 'YES' : 'NO');
  
  if (databaseUrl && databaseUrl.startsWith('prisma+postgres://')) {
    console.log('✅ Using Prisma Accelerate URL');
  } else {
    console.log('❌ Not a Prisma Accelerate URL');
    console.log('Current URL:', databaseUrl);
    process.exit(1);
  }

  // Try to import Prisma Client
  const { PrismaClient } = require('@prisma/client');
  console.log('✅ Prisma Client imported successfully');
  
  // Create client instance
  const prisma = new PrismaClient();
  console.log('✅ Prisma Client instance created');
  
  console.log('🎉 Basic setup is working! The database connection will be tested when you run your Next.js app.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
