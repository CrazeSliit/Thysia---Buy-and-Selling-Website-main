import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Admin User
  console.log('Creating admin user...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@thysia.com' },
    update: {},
    create: {
      email: 'admin@thysia.com',
      name: 'Admin User',
      password: await hash('admin123', 12),
      role: 'ADMIN',
    },
  })

  // Create Sample Buyer
  console.log('Creating buyer user...')
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      name: 'John Buyer',
      password: await hash('buyer123', 12),
      role: 'BUYER',
      buyerProfile: {
        create: {
          phone: '555-0123',
        }
      }
    },
  })

  // Create Sample Seller
  console.log('Creating seller user...')
  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      name: 'Jane Seller',
      password: await hash('seller123', 12),
      role: 'SELLER',
      sellerProfile: {
        create: {
          businessName: 'Jane\'s Electronics Store',
          businessPhone: '555-0124',
          businessAddress: '456 Business Ave, Commerce City, USA',
          isVerified: true,
        }
      }
    },
  })

  // Create Sample Driver
  console.log('Creating driver user...')
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@example.com' },
    update: {},
    create: {
      email: 'driver@example.com',
      name: 'Bob Driver',
      password: await hash('driver123', 12),
      role: 'DRIVER',
      driverProfile: {
        create: {
          phone: '555-0125',
          vehicleType: 'Motorcycle',
          licenseNumber: 'DRV-12345',
          isVerified: true,
        }
      }
    },
  })

  // Create Categories
  console.log('Creating categories...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Electronics' },
      update: {},
      create: {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Clothing' },
      update: {},
      create: {
        name: 'Clothing',
        description: 'Fashion and apparel',
        imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Home & Garden' },
      update: {},
      create: {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      },
    }),
  ])

  // Create Sample Products
  console.log('Creating products...')
  
  // Get the seller profile
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: sellerUser.id }
  })

  if (!sellerProfile) {
    throw new Error('Seller profile not found')
  }

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Smartphone',
        description: 'Latest model smartphone with advanced features',
        price: 699.99,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        categoryId: categories[0].id,
        sellerId: sellerProfile.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Laptop',
        description: 'High-performance laptop for work and gaming',
        price: 1299.99,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
        categoryId: categories[0].id,
        sellerId: sellerProfile.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 24.99,
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        categoryId: categories[1].id,
        sellerId: sellerProfile.id,
      },
    }),
  ])

  // Create Sample Address for Buyer
  console.log('Creating buyer address...')
  const buyerProfile = await prisma.buyerProfile.findUnique({
    where: { userId: buyerUser.id }
  })

  if (buyerProfile) {
    await prisma.address.create({
      data: {
        buyerId: buyerProfile.id,
        fullName: 'John Buyer',
        phone: '555-0123',
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'US',
        isDefault: true,
      },
    })
  }

  // Create Sample Cart Items
  console.log('Creating cart items...')
  if (buyerProfile) {
    await prisma.cartItem.create({
      data: {
        buyerId: buyerProfile.id,
        productId: products[0].id,
        quantity: 1,
      },
    })

    await prisma.cartItem.create({
      data: {
        buyerId: buyerProfile.id,
        productId: products[2].id,
        quantity: 2,
      },
    })
  }

  // Create Sample Order
  console.log('Creating sample order...')
  if (buyerProfile) {
    const address = await prisma.address.findFirst({
      where: { buyerId: buyerProfile.id }
    })

    if (address) {
      const order = await prisma.order.create({
        data: {
          buyerId: buyerProfile.id,
          addressId: address.id,
          status: 'CONFIRMED',
          totalAmount: 724.98,
          shippingFee: 9.99,
          taxes: 52.50,
          finalAmount: 787.47,
        },
      })

      // Create Order Items
      await Promise.all([
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: products[0].id,
            sellerId: sellerUser.id,
            quantity: 1,
            price: products[0].price,
          },
        }),
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: products[2].id,
            sellerId: sellerUser.id,
            quantity: 1,
            price: products[2].price,
          },
        }),
      ])

      // Create Sample Review
      await prisma.review.create({
        data: {
          buyerId: buyerProfile.id,
          productId: products[0].id,
          rating: 5,
          comment: 'Great product! Highly recommended.',
        },
      })

      // Create Sample Notifications
      await Promise.all([
        prisma.notification.create({
          data: {
            userId: buyerUser.id,
            orderId: order.id,
            type: 'ORDER_CONFIRMED',
            title: 'Order Confirmed',
            message: 'Your order has been confirmed and is being processed.',
          },
        }),
        prisma.notification.create({
          data: {
            userId: sellerUser.id,
            type: 'ORDER_PLACED',
            title: 'New Order Received',
            message: 'You have received a new order.',
          },
        }),
      ])
    }
  }

  // Create Sample Messages
  console.log('Creating sample messages...')
  await prisma.message.create({
    data: {
      senderId: buyerUser.id,
      receiverId: sellerUser.id,
      content: 'Hi, I have a question about the smartphone.',
      isRead: false,
    },
  })

  await prisma.message.create({
    data: {
      senderId: sellerUser.id,
      receiverId: buyerUser.id,
      content: 'Hi! I\'d be happy to help. What would you like to know?',
      isRead: false,
    },
  })

  // Create Sample Admin Log
  console.log('Creating admin log...')
  await prisma.adminLog.create({
    data: {
      adminId: adminUser.id,
      action: 'USER_CREATED',
      details: 'Created sample test users for development',
    },
  })

  console.log('✅ Database seed completed successfully!')
  console.log('📧 Test users created:')
  console.log('   Admin: admin@thysia.com / admin123')
  console.log('   Buyer: buyer@example.com / buyer123')
  console.log('   Seller: seller@example.com / seller123')
  console.log('   Driver: driver@example.com / driver123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
