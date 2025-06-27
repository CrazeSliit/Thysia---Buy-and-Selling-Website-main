'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Star, Edit, Trash2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  product: {
    id: string
    name: string
    imageUrl: string
    price: number
    category: {
      name: string
    }
    seller: {
      id: string
      businessName: string | null
    }
  }
}

interface ReviewsResponse {
  reviews: Review[]
}

export default function ReviewsList() {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingReview, setDeletingReview] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/user/reviews')
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      const data = await response.json()
      setReviewsData(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const deleteReview = async (reviewId: string) => {
    setDeletingReview(reviewId)
    try {
      const response = await fetch(`/api/user/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete review')
      }

      await fetchReviews()
      toast.success('Review deleted successfully')
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    } finally {
      setDeletingReview(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!reviewsData || reviewsData.reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-600 mb-4">You haven't reviewed any products yet</p>
        <Link href="/dashboard/buyer/orders">
          <Button>View Your Orders</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviewsData.reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">                <Image
                  src={review.product.imageUrl || '/placeholder-product.jpg'}
                  alt={review.product.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link 
                        href={`/products/${review.product.id}`}
                        className="hover:text-blue-600"
                      >
                        {review.product.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Category: {review.product.category.name}
                    </p>
                    {review.product.seller.businessName && (
                      <p className="text-sm text-gray-600">
                        Seller: {review.product.seller.businessName}
                      </p>
                    )}
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      ${review.product.price.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium text-gray-700">
                      {review.rating}/5
                    </span>
                  </div>
                  
                  {review.comment && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-2">
                      <p className="text-gray-700 text-sm">
                        "{review.comment}"
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end space-x-2 mt-4">
                  <Link href={`/dashboard/buyer/reviews/${review.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteReview(review.id)}
                    disabled={deletingReview === review.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deletingReview === review.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
