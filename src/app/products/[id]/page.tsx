'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Truck, Shield, RefreshCw } from 'lucide-react'
import AddToCartButton from '@/components/products/AddToCartButton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductPageProps {
  params: {
    id: string
  }
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string | null
  isActive: boolean
  isFeatured: boolean
  stock: number
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
  }
  seller: {
    id: string
    businessName: string | null
    isVerified: boolean
    user: {
      name: string | null
    }
  }
  reviews: Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    buyer: {
      user: {
        name: string | null
      }
    }
  }>
  _count: {
    reviews: number
    orderItems: number
    wishlistItems: number
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data.product)
        } else if (response.status === 404) {
          setError('Product not found')
        } else {
          setError('Failed to load product')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id])

  const shareProduct = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href)
        toast.success('Product link copied to clipboard!')
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Product link copied to clipboard!')
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-secondary-400 mb-4">
            <ShoppingCart className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            {error || 'Product Not Found'}
          </h1>
          <p className="text-secondary-600 mb-4">
            The product you're looking for doesn't exist or is no longer available.
          </p>
          <Link 
            href="/products"
            className="inline-flex items-center text-primary-600 hover:text-primary-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const getAverageRating = () => {
    if (!product || product.reviews.length === 0) return 0
    const sum = product.reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / product.reviews.length)
  }

  const averageRating = getAverageRating()

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/products"
            className="inline-flex items-center text-secondary-600 hover:text-secondary-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white">              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-secondary-200 flex items-center justify-center">
                  <ShoppingCart className="w-24 h-24 text-secondary-400" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                {product.isFeatured && (
                  <Badge className="bg-primary-600 text-white">
                    Featured
                  </Badge>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                    Only {product.stock} left
                  </Badge>
                )}
                {product.stock === 0 && (
                  <Badge variant="destructive">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Category */}
            <div className="text-sm text-secondary-600">
              <Link 
                href={`/products?category=${product.category.id}`}
                className="hover:text-secondary-900 transition-colors"
              >
                {product.category.name}
              </Link>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-secondary-900">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= averageRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-secondary-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-secondary-600">
                  {averageRating.toFixed(1)} ({product.reviews.length} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-4">
              <span className="text-3xl font-bold text-secondary-900">
                ${product.price.toFixed(2)}
              </span>
            </div>            {/* Seller Info */}
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-secondary-600">Sold by</p>
                <div className="font-medium text-secondary-900 flex items-center">
                  {product.seller.businessName || product.seller.user.name}
                  {product.seller.isVerified && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stock Info */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-600">Stock:</span>
              <span className={`text-sm font-medium ${
                product.stock > 10 ? 'text-green-600' : 
                product.stock > 0 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </span>
            </div>            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <AddToCartButton
                    productId={product.id}
                    stock={product.stock}
                    isActive={product.isActive}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={shareProduct}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center space-x-3 text-sm text-secondary-600">
                <Truck className="w-4 h-4" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-secondary-600">
                <Shield className="w-4 h-4" />
                <span>Secure payment & buyer protection</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-secondary-600">
                <RefreshCw className="w-4 h-4" />
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="space-y-8">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>            <CardContent>
              <div className="text-secondary-700 leading-relaxed">
                {product.description}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          {product.reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews ({product.reviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Rating Summary */}
                  <div className="flex items-center space-x-6 p-4 bg-secondary-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-secondary-900">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= averageRating
                                ? 'text-yellow-400 fill-current'
                                : 'text-secondary-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-secondary-600">
                        {product.reviews.length} reviews
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {product.reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b border-secondary-200 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-secondary-900">
                                {review.buyer.user.name}
                              </span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-secondary-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>                          <span className="text-sm text-secondary-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-secondary-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
