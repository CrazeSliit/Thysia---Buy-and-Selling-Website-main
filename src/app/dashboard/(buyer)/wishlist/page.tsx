import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import WishlistList from '@/components/dashboard/buyer/WishlistList'

export default async function BuyerWishlistPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/buyer/wishlist')
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
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">
              Products you've saved for later
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">💖 Save items you love</p>
          </div>
        </div>
      </div>

      {/* Wishlist */}
      <WishlistList />
    </div>
  )
}
