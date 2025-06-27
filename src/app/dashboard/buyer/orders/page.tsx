import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import OrdersList from '@/components/dashboard/buyer/OrdersList'

export default async function BuyerOrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  return (
    <DashboardLayout userRole="BUYER">
      <div className="space-y-6">
        <div className="border-b border-secondary-200 pb-4">
          <h1 className="text-2xl font-bold text-secondary-900">My Orders</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Track and manage all your orders
          </p>
        </div>
        
        <OrdersList userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
