#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test if User table exists by trying to count records
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Test if other main tables exist
    const productCount = await prisma.product.count();
    console.log(`✅ Found ${productCount} products in database`);
    
    console.log('🎉 Database is properly configured!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Solution: Run `npx prisma db push` to create the database tables');
    } else if (error.message.includes('connection')) {
      console.log('\n💡 Solution: Check your DATABASE_URL environment variable');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
