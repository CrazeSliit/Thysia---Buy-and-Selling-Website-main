// Script to check if the app is running correctly
import { prisma } from '../src/lib/prisma'

async function checkDatabaseConnection() {
  try {
    console.log('🔍 Checking database connection...')
    
    // Try to connect to the database
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Try to query users table
    const userCount = await prisma.user.count()
    console.log(`📊 Total users in database: ${userCount}`)
    
    // Check if admin exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (adminUser) {
      console.log('👑 Admin user exists:', adminUser.email)
    } else {
      console.log('⚠️  No admin user found')
    }
    
    await prisma.$disconnect()
    console.log('✅ Database check completed successfully')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

checkDatabaseConnection()
