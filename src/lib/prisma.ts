import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Auto-initialize database on first connection
let initialized = false
export async function ensurePrismaConnection() {
  if (!initialized) {
    try {
      await prisma.$connect()
      initialized = true
      console.log('✅ Prisma connected to MongoDB')
    } catch (error) {
      console.error('❌ Prisma connection failed:', error)
      throw error
    }
  }
}
