import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import BuyerOverview from '@/components/dashboard/buyer/BuyerOverview'

export default async function BuyerDashboardPage() {
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
          <h1 className="text-2xl font-bold text-secondary-900">Welcome back, {session.user.name}!</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Here's what's happening with your orders and account.
          </p>
        </div>
        
        <BuyerOverview userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
