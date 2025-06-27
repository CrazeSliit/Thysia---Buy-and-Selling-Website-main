import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AddressForm from '@/components/dashboard/buyer/AddressForm'

export default async function NewAddressPage() {
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
          <h1 className="text-2xl font-bold text-secondary-900">Add New Address</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Add a new shipping address to your account
          </p>
        </div>
        
        <AddressForm />
      </div>
    </DashboardLayout>
  )
}
