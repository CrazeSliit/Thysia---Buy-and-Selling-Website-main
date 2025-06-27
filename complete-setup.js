const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Setting up comprehensive test data for all user types...')
  
  try {
    // Clear existing data
    await prisma.cartItem.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.driverProfile.deleteMany()
    await prisma.buyerProfile.deleteMany()
    await prisma.sellerProfile.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('✅ Cleared existing data')
    
    // Create test users with hashed password
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    // 1. Create Admin User
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@thysia.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      }
    })
    
    console.log('✅ Created Admin user:', adminUser.email)
    
    // 2. Create Buyer User
    const buyerUser = await prisma.user.create({
      data: {
        email: 'buyer@example.com',
        name: 'John Buyer',
        password: hashedPassword,
        role: 'BUYER',
        isActive: true,
        buyerProfile: {
          create: {
            phone: '+1-555-0123'
          }
        }
      },
      include: { buyerProfile: true }
    })
    
    console.log('✅ Created Buyer user:', buyerUser.email)
    
    // 3. Create Seller User
    const sellerUser = await prisma.user.create({
      data: {
        email: 'seller@example.com',
        name: 'Jane Seller',
        password: hashedPassword,
        role: 'SELLER',
        isActive: true,
        sellerProfile: {
          create: {
            businessName: "Jane's Electronics Store",
            phone: '+1-555-0124',
            address: '456 Business Ave, Commerce City, USA',
            isVerified: true,
          }
        }
      },
      include: { sellerProfile: true }
    })
    
    console.log('✅ Created Seller user:', sellerUser.email)
    
    // 4. Create Driver User
    const driverUser = await prisma.user.create({
      data: {
        email: 'driver@example.com',
        name: 'Mike Driver',
        password: hashedPassword,
        role: 'DRIVER',
        isActive: true,
        driverProfile: {
          create: {
            phone: '+1-555-0125',
            vehicleType: 'Sedan',
            licenseNumber: 'DL123456789',
            isVerified: true,
            isAvailable: true,
          }
        }
      },
      include: { driverProfile: true }
    })
    
    console.log('✅ Created Driver user:', driverUser.email)
    
    // Create additional test users for variety
    const additionalBuyer = await prisma.user.create({
      data: {
        email: 'testbuyer@thysia.com',
        name: 'Test Buyer',
        password: hashedPassword,
        role: 'BUYER',
        isActive: true,
        buyerProfile: {
          create: {
            phone: '+1-555-0126'
          }
        }
      },
      include: { buyerProfile: true }
    })
    
    console.log('✅ Created additional test buyer:', additionalBuyer.email)
    
    // Create test categories
    const electronicsCategory = await prisma.category.create({
      data: {
        name: 'Electronics',
        description: 'Latest electronics and gadgets',
        imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
        isActive: true
      }
    })
    
    const clothingCategory = await prisma.category.create({
      data: {
        name: 'Clothing',
        description: 'Fashion and apparel for everyone',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        isActive: true
      }
    })
    
    console.log('✅ Created test categories')
    
    // Create test products
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        stock: 25,
        imageUrl: 'https://via.placeholder.com/300x300/007bff/ffffff?text=iPhone',
        categoryId: electronicsCategory.id,
        sellerId: sellerUser.sellerProfile.id,
        isActive: true
      },
      {
        name: 'MacBook Air M3',
        description: 'Ultra-thin laptop with M3 chip',
        price: 1299.99,
        stock: 15,
        imageUrl: 'https://via.placeholder.com/300x300/007bff/ffffff?text=MacBook',
        categoryId: electronicsCategory.id,
        sellerId: sellerUser.sellerProfile.id,
        isActive: true
      },
      {
        name: 'Wireless Headphones',
        description: 'High-quality noise-canceling headphones',
        price: 199.99,
        stock: 50,
        imageUrl: 'https://via.placeholder.com/300x300/28a745/ffffff?text=Headphones',
        categoryId: electronicsCategory.id,
        sellerId: sellerUser.sellerProfile.id,
        isActive: true
      },
      {
        name: 'Premium T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 29.99,
        stock: 100,
        imageUrl: 'https://via.placeholder.com/300x300/6c757d/ffffff?text=T-Shirt',
        categoryId: clothingCategory.id,
        sellerId: sellerUser.sellerProfile.id,
        isActive: true
      },
      {
        name: 'Denim Jeans',
        description: 'Classic blue denim jeans',
        price: 79.99,
        stock: 75,
        imageUrl: 'https://via.placeholder.com/300x300/6c757d/ffffff?text=Jeans',
        categoryId: clothingCategory.id,
        sellerId: sellerUser.sellerProfile.id,
        isActive: true
      }
    ]
    
    const createdProducts = []
    for (const productData of products) {
      const product = await prisma.product.create({ data: productData })
      createdProducts.push(product)
    }
    
    console.log('✅ Created test products:', createdProducts.length)
    
    // Create test cart items for both buyers
    const cartItems = [
      {
        buyerId: buyerUser.buyerProfile.id,
        productId: createdProducts[0].id, // iPhone
        quantity: 1
      },
      {
        buyerId: buyerUser.buyerProfile.id,
        productId: createdProducts[2].id, // Headphones
        quantity: 2
      },
      {
        buyerId: additionalBuyer.buyerProfile.id,
        productId: createdProducts[1].id, // MacBook
        quantity: 1
      },
      {
        buyerId: additionalBuyer.buyerProfile.id,
        productId: createdProducts[3].id, // T-Shirt
        quantity: 3
      }
    ]
    
    for (const cartItemData of cartItems) {
      await prisma.cartItem.create({ data: cartItemData })
    }
    
    console.log('✅ Created test cart items')
    
    // Test cart functionality
    const cartData = await prisma.cartItem.findMany({
      include: {
        product: {
          include: {
            category: true,
            seller: true
          }
        },
        buyer: {
          include: {
            user: true
          }
        }
      }
    })
    
    console.log(`✅ Cart test successful! Found ${cartData.length} cart items:`)
    cartData.forEach(item => {
      console.log(`  - ${item.buyer.user.name}: ${item.quantity}x ${item.product.name} ($${item.product.price})`)
    })
    
    // Display comprehensive login information
    console.log('\n🔐 === COMPLETE LOGIN CREDENTIALS ===')
    console.log('\n👨‍💼 ADMIN LOGIN:')
    console.log(`Email: ${adminUser.email}`)
    console.log('Password: password123')
    console.log('Role: Administrator')
    console.log('Access: Full system access, user management, analytics')
    
    console.log('\n🛒 BUYER LOGINS:')
    console.log(`1. Email: ${buyerUser.email}`)
    console.log('   Password: password123')
    console.log('   Role: Buyer')
    console.log('   Access: Browse products, manage cart, place orders')
    
    console.log(`2. Email: ${additionalBuyer.email}`)
    console.log('   Password: password123')
    console.log('   Role: Buyer (Test Account)')
    console.log('   Access: Browse products, manage cart, place orders')
    
    console.log('\n🏪 SELLER LOGIN:')
    console.log(`Email: ${sellerUser.email}`)
    console.log('Password: password123')
    console.log('Role: Seller')
    console.log(`Business: ${sellerUser.sellerProfile.businessName}`)
    console.log('Access: Manage products, view orders, business analytics')
    
    console.log('\n🚚 DRIVER LOGIN:')
    console.log(`Email: ${driverUser.email}`)
    console.log('Password: password123')
    console.log('Role: Driver')
    console.log(`Vehicle: ${driverUser.driverProfile.vehicleType}`)
    console.log('Access: View deliveries, manage availability, earnings')
    
    console.log('\n🌐 === APPLICATION URLS ===')
    console.log('Main Application: http://localhost:3000')
    console.log('Sign In Page: http://localhost:3000/auth/signin')
    console.log('Sign Up Page: http://localhost:3000/auth/signup')
    console.log('')
    console.log('Dashboard URLs (auto-redirect based on role):')
    console.log('• Admin Dashboard: http://localhost:3000/dashboard/admin')
    console.log('• Buyer Dashboard: http://localhost:3000/dashboard/buyer')
    console.log('• Seller Dashboard: http://localhost:3000/dashboard/seller')
    console.log('• Driver Dashboard: http://localhost:3000/dashboard/driver')
    
    console.log('\n📱 === API ENDPOINTS TO TEST ===')
    console.log('Cart API: http://localhost:3000/api/cart (requires buyer login)')
    console.log('Products API: http://localhost:3000/api/products')
    console.log('Auth API: http://localhost:3000/api/auth/signin')
    
    console.log('\n🎯 === TESTING RECOMMENDATIONS ===')
    console.log('1. Test Admin: Login → Manage users → View all data')
    console.log('2. Test Buyer: Login → Browse products → Add to cart → Checkout')
    console.log('3. Test Seller: Login → Add products → Manage inventory → View orders')
    console.log('4. Test Driver: Login → View deliveries → Update status')
    console.log('')
    console.log('✨ All test data created successfully!')
    console.log('   Database: SQLite (dev.db)')
    console.log('   Total Users: 5 (1 Admin, 2 Buyers, 1 Seller, 1 Driver)')
    console.log('   Total Products: 5')
    console.log('   Total Categories: 2')
    console.log('   Cart Items: 4 (across 2 buyers)')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
