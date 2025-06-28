import { prisma } from '@/lib/prisma'

let dbInitialized = false

export async function initializeDatabase() {
  if (dbInitialized) {
    return { success: true, message: 'Database already initialized' }
  }

  try {
    console.log('🔄 Initializing MongoDB database...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to MongoDB')
    
    // Check if basic data exists, if not create it
    const categoryCount = await prisma.category.count()
    
    if (categoryCount === 0) {
      console.log('📦 Creating initial categories...')
      await prisma.category.createMany({
        data: [
          { name: 'Electronics', description: 'Electronic devices and gadgets' },
          { name: 'Clothing', description: 'Fashion and apparel' },
          { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
          { name: 'Books', description: 'Books and educational materials' },
          { name: 'Sports', description: 'Sports and fitness equipment' }
        ]
      })
      console.log('✅ Initial categories created')
    }
    
    dbInitialized = true
    console.log('✅ Database initialization complete')
    
    return { 
      success: true, 
      message: 'Database initialized successfully',
      categoriesCreated: categoryCount === 0
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Auto-initialize on first import (for API routes)
export async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase()
  }
}