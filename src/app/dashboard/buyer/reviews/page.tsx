import { Suspense } from 'react'
import { Metadata } from 'next'
import ReviewsList from '@/components/dashboard/buyer/ReviewsList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'My Reviews | Buyer Dashboard',
  description: 'Manage your product reviews',
}

export default function ReviewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
            <p className="text-gray-600 mt-2">Your product reviews and ratings</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <ReviewsList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
