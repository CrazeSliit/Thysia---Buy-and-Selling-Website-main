'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ShoppingCart, Heart, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface AddToCartButtonProps {
  productId: string
  stock: number
  isActive: boolean
  className?: string
}

export default function AddToCartButton({ 
  productId, 
  stock, 
  isActive, 
  className = '' 
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  // Check if user is a buyer
  const isBuyer = session?.user?.role === 'BUYER'
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  const addToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart')
      router.push('/auth/signin?callbackUrl=/products')
      return
    }

    if (!isBuyer) {
      toast.error('Only buyers can purchase products')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId, 
          quantity: 1 
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please sign in to add items to cart')
          router.push('/auth/signin?callbackUrl=/products')
          return
        }
        if (response.status === 403) {
          toast.error('Only buyers can purchase products')
          return
        }
        throw new Error('Failed to add item to cart')
      }

      const data = await response.json()
      toast.success('Item added to cart successfully!')
      
      // Optional: Show a quick action to go to cart
      setTimeout(() => {
        toast.info('View Cart', {
          action: {
            label: 'Go to Cart',
            onClick: () => router.push('/dashboard/buyer/cart')
          }
        })
      }, 1000)

    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to wishlist')
      router.push('/auth/signin?callbackUrl=/products')
      return
    }

    if (!isBuyer) {
      toast.error('Only buyers can add items to wishlist')
      return
    }

    setAddingToWishlist(true)
    try {
      const response = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please sign in to add items to wishlist')
          router.push('/auth/signin?callbackUrl=/products')
          return
        }
        if (response.status === 403) {
          toast.error('Only buyers can add items to wishlist')
          return
        }
        if (response.status === 409) {
          toast.info('Item is already in your wishlist')
          return
        }
        throw new Error('Failed to add item to wishlist')
      }

      toast.success('Item added to wishlist!')
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error('Failed to add item to wishlist')
    } finally {
      setAddingToWishlist(false)
    }
  }

  const isDisabled = !isActive || stock === 0

  // If loading session, show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button disabled className="flex-1 h-9" size="sm">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading...
        </Button>
      </div>
    )
  }

  // If not authenticated, show sign in button
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          onClick={() => router.push('/auth/signin?callbackUrl=/products')}
          className="flex-1 h-9"
          size="sm"
        >
          <User className="w-4 h-4 mr-2" />
          Sign In to Purchase
        </Button>
      </div>
    )
  }

  // If not a buyer, show info message
  if (!isBuyer) {
    const roleMessages = {
      SELLER: 'Sellers cannot purchase products',
      DRIVER: 'Drivers cannot purchase products', 
      ADMIN: 'Admins cannot purchase products'
    }
    
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button disabled className="flex-1 h-9" size="sm" variant="outline">
          <ShoppingCart className="w-4 h-4 mr-2" />
          {roleMessages[session?.user?.role as keyof typeof roleMessages] || 'Cannot purchase'}
        </Button>
      </div>
    )
  }

  // For buyers, show normal cart functionality
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        onClick={addToCart}
        disabled={isDisabled || loading}
        className="flex-1 h-9"
        size="sm"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <ShoppingCart className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Adding...' : isDisabled ? 'Out of Stock' : 'Add to Cart'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={addToWishlist}
        disabled={addingToWishlist}
        className="p-2"
      >
        {addingToWishlist ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}
