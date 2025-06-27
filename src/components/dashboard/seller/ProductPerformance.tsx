import { prisma } from '@/lib/prisma'
import { TrendingUp, TrendingDown, Eye, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface ProductPerformanceProps {
  userId: string
}

async function getProductPerformance(userId: string) {
  try {
    // Get the seller profile first
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true }
    })

    if (!sellerProfile) {
      return []
    }

    // Get products with their order statistics
    const products = await prisma.product.findMany({
      where: {
        sellerId: sellerProfile.id,
        isActive: true
      },
      include: {
        orderItems: {
          select: {
            quantity: true,
            priceAtTime: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Calculate performance metrics for each product
    const productsWithMetrics = products.map(product => {
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalRevenue = product.orderItems.reduce((sum, item) => sum + (item.quantity * item.priceAtTime), 0)
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        totalSold,
        totalRevenue,
        avgRating,
        reviewCount: product.reviews.length
      }
    })

    return productsWithMetrics
  } catch (error) {
    console.error('Error fetching product performance:', error)
    return []
  }
}

export default async function ProductPerformance({ userId }: ProductPerformanceProps) {
  const products = await getProductPerformance(userId)

  if (products.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 bg-secondary-200 rounded-lg flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-6 h-6 text-secondary-400" />
        </div>
        <p className="text-secondary-500 mb-4">No products to analyze</p>
        <Link
          href="/dashboard/seller/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Add Your First Product
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Units Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {product.imageUrl ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.imageUrl}
                          alt={product.name}
                        />
                      ) : (
                        <div className="h-12 w-12 bg-secondary-200 rounded-lg flex items-center justify-center">
                          <span className="text-secondary-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900 max-w-48 truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-secondary-500">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-secondary-900">{product.totalSold}</span>
                    {product.totalSold > 0 && (
                      <TrendingUp className="ml-1 w-4 h-4 text-green-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-secondary-900">
                    ${product.totalRevenue.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.avgRating > 0 ? (
                      <>
                        <span className="text-sm text-secondary-900">
                          {product.avgRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-secondary-500 ml-1">
                          ({product.reviewCount})
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-secondary-400">No reviews</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.stock > 10 
                      ? 'bg-green-100 text-green-800'
                      : product.stock > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-primary-600 hover:text-primary-900"
                      title="View product"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/dashboard/seller/products/${product.id}/edit`}
                      className="text-secondary-600 hover:text-secondary-900"
                      title="Edit product"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
