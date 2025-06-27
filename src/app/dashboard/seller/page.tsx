import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SellerOverview from '@/components/dashboard/seller/SellerOverview'
import OrderStatistics from '@/components/dashboard/seller/OrderStatistics'

export default async function SellerDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'SELLER') {
    redirect('/unauthorized')
  }
  return (
    <DashboardLayout userRole="SELLER">
      <div className="space-y-6">
        <div className="border-b border-secondary-200 pb-4">
          <h1 className="text-2xl font-bold text-secondary-900">Seller Dashboard</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage your store, products, and orders
          </p>
        </div>
        
        <SellerOverview userId={session.user.id} />
        
        {/* Comprehensive Order Statistics */}
        <OrderStatistics userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
