const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestShipments() {
  try {
    console.log('🚀 Creating test shipments...')

    // First, let's check if we have the necessary data
    const buyer = await prisma.buyerProfile.findFirst({
      include: {
        user: true,
        addresses: true
      }
    })

    if (!buyer) {
      console.log('❌ No buyer found. Please create a buyer first.')
      return
    }

    if (buyer.addresses.length === 0) {
      console.log('❌ No addresses found for buyer. Please create an address first.')
      return
    }

    const products = await prisma.product.findMany({
      take: 3,
      where: {
        isActive: true,
        stock: { gt: 0 }
      }
    })

    if (products.length === 0) {
      console.log('❌ No active products found. Please create some products first.')
      return
    }

    console.log(`✅ Found buyer: ${buyer.user.name || buyer.user.email}`)
    console.log(`✅ Found ${products.length} products`)
    console.log(`✅ Found ${buyer.addresses.length} addresses`)

    // Create test orders with different statuses
    const testOrders = [
      {
        status: 'CONFIRMED',
        description: 'Ready for pickup'
      },
      {
        status: 'PROCESSING',
        description: 'Being prepared for delivery'
      },
      {
        status: 'SHIPPED', 
        description: 'Out for delivery'
      }
    ]

    for (let i = 0; i < testOrders.length; i++) {
      const testOrder = testOrders[i]
      const product = products[i % products.length]
      const address = buyer.addresses[0]

      // Calculate order totals
      const quantity = Math.floor(Math.random() * 3) + 1 // 1-3 items
      const itemTotal = product.price * quantity
      const shippingFee = 5.99
      const taxes = itemTotal * 0.08 // 8% tax
      const finalAmount = itemTotal + shippingFee + taxes

      // Create order
      const order = await prisma.order.create({
        data: {
          buyerId: buyer.id,
          addressId: address.id,
          status: testOrder.status,
          totalAmount: itemTotal,
          shippingFee: shippingFee,
          taxes: taxes,
          finalAmount: finalAmount,
          orderItems: {
            create: [
              {
                productId: product.id,
                quantity: quantity,
                price: product.price,
                sellerId: product.sellerId
              }
            ]
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          shippingAddress: true,
          buyer: {
            include: {
              user: true
            }
          }
        }
      })

      console.log(`✅ Created order with status ${testOrder.status}:`)
      console.log(`   - Order ID: ${order.id}`)
      console.log(`   - Shipment ID: shipment_${order.id}`)
      console.log(`   - Total: $${order.finalAmount.toFixed(2)}`)
      console.log(`   - Product: ${order.orderItems[0].product.name} x ${order.orderItems[0].quantity}`)
      console.log(`   - Description: ${testOrder.description}`)
      console.log('')
    }

    console.log('🎉 Test shipments created successfully!')
    console.log('💡 You can now view them at: http://localhost:3000/dashboard/driver/shipments')

  } catch (error) {
    console.error('❌ Error creating test shipments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestShipments()
