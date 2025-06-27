import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create Admin User
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
          phone: '555-0124',
          address: '456 Business Ave, Commerce City, USA',
          isVerified: true,
        }
      }
    },
  })

  // Create Sample Driver
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@example.com' },
    update: {},
    create: {
      email: 'driver@example.com',
      name: 'Mike Driver',
      password: await hash('driver123', 12),
      role: 'DRIVER',
      driverProfile: {
        create: {
          phone: '555-0125',
          vehicleType: 'Sedan',
          licenseNumber: 'DL123456789',
          isVerified: true,
          isAvailable: true,
        }
      }
    },
  })

  // Create Categories
  const electronicsCategory = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Latest electronics and gadgets',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    },
  })

  const clothingCategory = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: {
      name: 'Clothing',
      description: 'Fashion and apparel for everyone',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    },
  })

  const homeCategory = await prisma.category.upsert({
    where: { name: 'Home & Garden' },
    update: {},
    create: {
      name: 'Home & Garden',
      description: 'Everything for your home and garden',
      imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
    },
  })

  // Get seller profile for product creation
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: sellerUser.id }
  })

  if (sellerProfile) {
    // Create Sample Products
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'The latest iPhone with Pro camera system and titanium design. Features the powerful A17 Pro chip for incredible performance.',
        price: 999.99,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        isFeatured: true,
        categoryId: electronicsCategory.id,
        sellerId: sellerProfile.id,
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android smartphone with S Pen and incredible camera capabilities. Perfect for productivity and creativity.',
        price: 899.99,
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
        isFeatured: true,
        categoryId: electronicsCategory.id,
        sellerId: sellerProfile.id,
      },
      {
        name: 'Classic White T-Shirt',
        description: 'Premium cotton t-shirt in classic white. Comfortable fit and excellent quality.',
        price: 29.99,
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        categoryId: clothingCategory.id,
        sellerId: sellerProfile.id,
      },
      {
        name: 'Cozy Reading Chair',
        description: 'Comfortable armchair perfect for reading. High-quality fabric and sturdy construction.',
        price: 299.99,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        categoryId: homeCategory.id,
        sellerId: sellerProfile.id,
      },
    ]

    for (const productData of products) {
      await prisma.product.create({
        data: productData,
      })
    }
  }

  // Create sample order for the buyer
  const buyerProfile = await prisma.buyerProfile.findUnique({
    where: { userId: buyerUser.id }
  })

  if (buyerProfile && sellerProfile) {    // Find a product to order and create an address first
    const product = await prisma.product.findFirst({
      where: { sellerId: sellerProfile.id }
    })

    if (product) {
      // Create an address for the buyer first
      const address = await prisma.address.create({
        data: {
          buyerId: buyerProfile.id,
          type: 'HOME',
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          phone: '+1234567890',
          isDefault: true        }
      })

      const subtotal = product.price * 2
      const taxAmount = subtotal * 0.08
      const shippingCost = 9.99
      const totalAmount = subtotal + taxAmount + shippingCost

      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-SEED`,
          buyerId: buyerUser.id,
          status: 'DELIVERED',
          paymentStatus: 'PAID',
          paymentMethod: 'CREDIT_CARD',
          subtotal,
          taxAmount,
          shippingCost,
          totalAmount,
          shippingAddressId: address.id,
          billingAddressId: address.id,
          orderItems: {
            create: {
              productId: product.id,
              sellerId: sellerUser.id, // Use seller's User ID, not SellerProfile ID
              quantity: 2,
              priceAtTime: product.price,
              totalPrice: product.price * 2
            }
          }
        }
      })// Create a delivery for the order
      const driverProfile = await prisma.driverProfile.findUnique({
        where: { userId: driverUser.id }
      })
      
      await prisma.delivery.create({
        data: {
          orderId: order.id,
          driverId: driverProfile?.id,
          status: 'DELIVERED'
        }
      })

      // Create a review
      await prisma.review.create({
        data: {
          productId: product.id,
          userId: buyerUser.id,
          rating: 5,
          comment: 'Excellent product! Highly recommended.'
        }
      })
    }
  }

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: buyerUser.id,
      title: 'Welcome to Thysia!',
      message: 'Thank you for joining our marketplace.'
    }
  })

  await prisma.notification.create({
    data: {
      userId: sellerUser.id,
      title: 'Store Verified',
      message: 'Your store has been verified and is now live!'
    }
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
