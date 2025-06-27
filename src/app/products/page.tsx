import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Star, ShoppingCart } from 'lucide-react'
import AddToCartButton from '@/components/products/AddToCartButton'

async function getProducts() {
  return await prisma.product.findMany({
    where: {
      isActive: true
    },
    include: {
      category: true,
      seller: {
        select: {
          businessName: true,
          isVerified: true
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
    }
  })
}

export default async function ProductsPage() {
  const products = await getProducts()

  const getAverageRating = (reviews: { rating: number }[]) => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            All Products
          </h1>
          <p className="text-secondary-600">
            Discover amazing products from our verified sellers
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Category
              </label>
              <select className="input-field w-auto min-w-[150px]">
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="home-garden">Home & Garden</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Price Range
              </label>
              <select className="input-field w-auto min-w-[150px]">
                <option value="">Any Price</option>
                <option value="0-50">$0 - $50</option>
                <option value="50-200">$50 - $200</option>
                <option value="200-500">$200 - $500</option>
                <option value="500+">$500+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Sort By
              </label>
              <select className="input-field w-auto min-w-[150px]">
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-secondary-400 mb-4">
              <ShoppingCart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No products found
            </h3>
            <p className="text-secondary-600">
              Check back later for new products or adjust your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const averageRating = getAverageRating(product.reviews)
              const hasDiscount = false // Simplified since originalPrice doesn't exist yet

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="card hover:shadow-lg transition-shadow duration-200"
                >                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    {product.imageUrl ? (                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
                        <ShoppingCart className="w-16 h-16 text-secondary-400" />
                      </div>
                    )}
                    
                    {/* Featured Badge */}
                    {product.isFeatured && (
                      <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded">
                        Featured
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                        Sale
                      </div>
                    )}

                    {/* Stock Warning */}
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded">
                        Only {product.stock} left
                      </div>
                    )}

                    {/* Out of Stock */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Category & Seller */}
                    <div className="flex items-center justify-between text-xs text-secondary-500 mb-2">
                      <span className="bg-secondary-100 px-2 py-1 rounded">
                        {product.category.name}
                      </span>
                      <span className="flex items-center">
                        {product.seller.isVerified && (
                          <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {product.seller.businessName || 'Unknown Seller'}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-medium text-secondary-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.floor(Number(averageRating))
                                ? 'text-yellow-400 fill-current'
                                : 'text-secondary-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-secondary-500 ml-1">
                        {averageRating} ({product.reviews.length})
                      </span>
                    </div>                    {/* Price and Add to Cart */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-primary-600">
                            ${product.price.toFixed(2)}
                          </span>                        {hasDiscount && (
                            <span className="text-sm text-secondary-400 line-through">
                              $0.00
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-secondary-500">
                          {product.stock} left
                        </span>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <AddToCartButton 
                        productId={product.id}
                        stock={product.stock}
                        isActive={product.isActive}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
