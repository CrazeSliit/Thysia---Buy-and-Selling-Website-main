import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ReviewsList from '@/components/dashboard/buyer/ReviewsList'

export default async function BuyerReviewsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/buyer/reviews')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
            <p className="text-gray-600 mt-1">
              Reviews and ratings you've submitted
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">⭐ Share your experience</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <ReviewsList />
    </div>
  )
}
