'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Trash2, ShoppingCart, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WishlistItem {
  id: string
  createdAt: string
  product: {
    id: string
    name: string
    description: string
    price: number
    imageUrl: string
    stock: number
    isActive: boolean
    category: {
      name: string
    }
    seller: {
      id: string
      businessName: string | null
    }
    createdAt: string
    updatedAt: string
  }
}

interface WishlistResponse {
  wishlist: WishlistItem[]
}

export default function WishlistList() {
  const [wishlistData, setWishlistData] = useState<WishlistResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  useEffect(() => {
    fetchWishlistItems()
  }, [])

  const fetchWishlistItems = async () => {
    try {
      const response = await fetch('/api/user/wishlist')
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist items')
      }
      const data = await response.json()
      setWishlistData(data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      toast.error('Failed to load wishlist items')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    setRemovingItem(productId)
    try {
      const response = await fetch(`/api/user/wishlist?productId=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove item from wishlist')
      }

      await fetchWishlistItems()
      toast.success('Item removed from wishlist')
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove item from wishlist')
    } finally {
      setRemovingItem(null)
    }
  }

  const addToCart = async (productId: string) => {
    setAddingToCart(productId)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (!response.ok) {
        throw new Error('Failed to add item to cart')
      }

      toast.success('Item added to cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    } finally {
      setAddingToCart(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!wishlistData || wishlistData.wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
        <p className="text-gray-600 mb-4">Save products you love to buy them later</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlistData.wishlist.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <div className="aspect-w-16 aspect-h-9 relative h-48 w-full overflow-hidden">              <Image
                src={item.product.imageUrl || '/placeholder-product.jpg'}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="absolute top-2 right-2">
              <Badge variant={item.product.isActive ? 'default' : 'destructive'}>
                {item.product.isActive ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                  <Link 
                    href={`/products/${item.product.id}`}
                    className="hover:text-blue-600"
                  >
                    {item.product.name}
                  </Link>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {item.product.category.name}
                </p>
                {item.product.seller.businessName && (
                  <p className="text-sm text-gray-600">
                    by {item.product.seller.businessName}
                  </p>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">
                  ${item.product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600">
                  {item.product.stock} in stock
                </span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2">
                {item.product.description}
              </p>
              
              <div className="flex space-x-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => addToCart(item.product.id)}
                  disabled={
                    !item.product.isActive || 
                    item.product.stock === 0 || 
                    addingToCart === item.product.id
                  }
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {addingToCart === item.product.id ? 'Adding...' : 'Add to Cart'}
                </Button>
                
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeFromWishlist(item.product.id)}
                  disabled={removingItem === item.product.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-500">
                Added {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
