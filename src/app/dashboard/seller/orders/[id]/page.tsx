import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SellerOrderDetails from '@/components/dashboard/seller/SellerOrderDetails'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface SellerOrderDetailsPageProps {
  params: {
    id: string
  }
}

async function getOrderForSeller(orderId: string, userId: string) {
  try {
    // Get seller profile first
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true }
    })

    if (!sellerProfile) {
      return null
    }

    // Get the order that contains products from this seller
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        orderItems: {
          some: {
            product: {
              sellerId: sellerProfile.id
            }
          }
        }
      },
      include: {
        buyer: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        orderItems: {
          where: {
            product: {
              sellerId: sellerProfile.id
            }
          },
          include: {
            product: {
              include: {
                category: true,
                seller: {
                  select: {
                    id: true,
                    businessName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return order
  } catch (error) {
    console.error('Error fetching order for seller:', error)
    return null
  }
}

export default async function SellerOrderDetailsPage({ params }: SellerOrderDetailsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'SELLER') {
    redirect('/unauthorized')
  }

  const order = await getOrderForSeller(params.id, session.user.id)

  if (!order) {
    notFound()
  }

  return (
    <DashboardLayout userRole="SELLER">
      <div className="space-y-6">
        <div className="border-b border-secondary-200 pb-4">
          <h1 className="text-2xl font-bold text-secondary-900">
            Order #{order.id.slice(-8)}
          </h1>
          <p className="mt-1 text-sm text-secondary-600">
            Order details and management for your products
          </p>
        </div>
          <SellerOrderDetails 
          order={{
            ...order,
            buyer: {
              id: order.buyer.id,
              name: order.buyer.user.name,
              email: order.buyer.user.email
            },
            total: order.totalAmount, // Map totalAmount to total
            items: order.orderItems.map(item => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price, // Use price instead of priceAtTime
              product: {
                ...item.product,
                imageUrl: item.product.imageUrl || '/placeholder-product.jpg'
              }
            })),
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            delivery: null // Delivery functionality not implemented yet
          }} 
        />
      </div>
    </DashboardLayout>
  )
}
