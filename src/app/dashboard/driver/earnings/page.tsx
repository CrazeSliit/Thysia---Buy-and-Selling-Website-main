import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default async function DriverEarningsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'DRIVER') {
    redirect('/unauthorized')
  }

  return (
    <DashboardLayout userRole="DRIVER">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Earnings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your delivery earnings and payments
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">Earnings tracking is under development.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
