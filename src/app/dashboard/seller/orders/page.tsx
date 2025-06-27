import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SellerOrdersList from '@/components/dashboard/seller/SellerOrdersList'

export default async function SellerOrdersPage() {
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
          <h1 className="text-2xl font-bold text-secondary-900">Orders</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage and track all orders for your products
          </p>
        </div>
        
        <SellerOrdersList userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
