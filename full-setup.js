const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Setting up comprehensive test data...')
  
  try {
    // Clear existing data
    await prisma.cartItem.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.buyerProfile.deleteMany()
    await prisma.sellerProfile.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('✅ Cleared existing data')
    
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const testBuyer = await prisma.user.create({
      data: {
        email: 'testbuyer@example.com',
        name: 'Test Buyer',
        password: hashedPassword,
        role: 'BUYER',
        buyerProfile: {
          create: {
            phone: '+1234567890'
          }
        }
      },
      include: { buyerProfile: true }
    })
    
    const testSeller = await prisma.user.create({
      data: {
        email: 'testseller@example.com',
        name: 'Test Seller',
        password: hashedPassword,
        role: 'SELLER',
        sellerProfile: {
          create: {
            businessName: 'Test Electronics Store'
          }
        }
      },
      include: { sellerProfile: true }
    })
    
    console.log('✅ Created test users')
    
    // Create test category
    const category = await prisma.category.create({
      data: {
        name: 'Electronics',
        description: 'Electronic items and gadgets'
      }
    })
    
    console.log('✅ Created test category')
    
    // Create test products
    const product1 = await prisma.product.create({
      data: {
        name: 'Smartphone XYZ',
        description: 'Latest smartphone with great features',
        price: 599.99,
        stock: 50,
        imageUrl: 'https://via.placeholder.com/300x300/007bff/ffffff?text=Phone',
        categoryId: category.id,
        sellerId: testSeller.sellerProfile.id
      }
    })
    
    const product2 = await prisma.product.create({
      data: {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones',
        price: 199.99,
        stock: 30,
        imageUrl: 'https://via.placeholder.com/300x300/28a745/ffffff?text=Headphones',
        categoryId: category.id,
        sellerId: testSeller.sellerProfile.id
      }
    })
    
    console.log('✅ Created test products')
    
    // Create test cart items
    await prisma.cartItem.create({
      data: {
        buyerId: testBuyer.buyerProfile.id,
        productId: product1.id,
        quantity: 2
      }
    })
    
    await prisma.cartItem.create({
      data: {
        buyerId: testBuyer.buyerProfile.id,
        productId: product2.id,
        quantity: 1
      }
    })
    
    console.log('✅ Created test cart items')
    
    // Test the cart query
    const cartData = await prisma.cartItem.findMany({
      where: { buyerId: testBuyer.buyerProfile.id },
      include: {
        product: {
          include: {
            category: {
              select: { name: true }
            },
            seller: {
              select: { 
                id: true,
                businessName: true 
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`✅ Cart test successful! Found ${cartData.length} items:`)
    cartData.forEach(item => {
      console.log(`  - ${item.quantity}x ${item.product.name} ($${item.product.price}) from ${item.product.seller.businessName}`)
    })
    
    const summary = {
      totalItems: cartData.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: cartData.reduce((sum, item) => sum + (item.quantity * item.product.price), 0),
      itemCount: cartData.length
    }
    
    console.log('📊 Cart Summary:')
    console.log(`  - Total Items: ${summary.totalItems}`)
    console.log(`  - Total Amount: $${summary.totalAmount.toFixed(2)}`)
    console.log(`  - Item Count: ${summary.itemCount}`)
    
    console.log('\n🔐 Test Login Credentials:')
    console.log(`Buyer Email: ${testBuyer.email}`)
    console.log(`Seller Email: ${testSeller.email}`)
    console.log('Password: password123')
    console.log('\n🌐 Application URLs:')
    console.log('Main App: http://localhost:3000')
    console.log('Sign In: http://localhost:3000/auth/signin')
    console.log('Cart API: http://localhost:3000/api/cart')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
