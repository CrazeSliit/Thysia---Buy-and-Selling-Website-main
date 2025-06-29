const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestDriver() {
  try {
    console.log('🚗 Creating test driver account...')

    // Check if driver already exists
    const existingDriver = await prisma.user.findFirst({
      where: {
        role: 'DRIVER'
      }
    })

    if (existingDriver) {
      console.log('✅ Driver account already exists:', existingDriver.email)
      return
    }

    // Create driver user
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const driver = await prisma.user.create({
      data: {
        email: 'driver@test.com',
        name: 'Test Driver',
        password: hashedPassword,
        role: 'DRIVER',
        isActive: true,
        driverProfile: {
          create: {
            licenseNumber: 'DL123456789',
            vehicleType: 'Car',
            vehicleModel: 'Toyota Camry',
            vehiclePlate: 'ABC-123',
            isAvailable: true,
            ratings: 4.8,
            totalDeliveries: 0
          }
        }
      },
      include: {
        driverProfile: true
      }
    })

    console.log('✅ Driver account created successfully!')
    console.log(`   - Email: ${driver.email}`)
    console.log(`   - Password: password123`)
    console.log(`   - Name: ${driver.name}`)
    console.log(`   - Role: ${driver.role}`)
    console.log(`   - Driver ID: ${driver.driverProfile.id}`)
    console.log('')
    console.log('💡 You can now sign in as a driver at: http://localhost:3000/auth/signin')

  } catch (error) {
    console.error('❌ Error creating driver account:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestDriver()
