import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DriverOverview from '@/components/dashboard/driver/DriverOverview'

export default async function DriverDashboardPage() {
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
        <div className="border-b border-secondary-200 pb-4">
          <h1 className="text-2xl font-bold text-secondary-900">Driver Dashboard</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage your deliveries and track earnings
          </p>
        </div>
        
        <DriverOverview userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
