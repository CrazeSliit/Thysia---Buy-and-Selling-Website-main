import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AddressList from '@/components/dashboard/buyer/AddressList'
import { Address } from '@/types/address'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

async function getBuyerAddresses(userId: string): Promise<Address[]> {
  try {
    // Get buyer profile
    const buyerProfile = await prisma.buyerProfile.findUnique({
      where: { userId },
      select: { id: true }
    })

    if (!buyerProfile) {
      return []
    }

    // Fetch addresses
    const addresses = await prisma.address.findMany({
      where: { buyerId: buyerProfile.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })    // Convert dates to strings for serialization
    return addresses.map(address => ({
      ...address,
      type: address.type as 'HOME' | 'WORK' | 'OTHER',
      company: address.company ?? undefined,
      address2: address.address2 ?? undefined,
      phone: address.phone ?? undefined,
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return []
  }
}

export default async function AddressesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  const addresses = await getBuyerAddresses(session.user.id)

  return (
    <DashboardLayout userRole="BUYER">
      <div className="space-y-6">
        <div className="border-b border-secondary-200 pb-4">
          <h1 className="text-2xl font-bold text-secondary-900">Shipping Addresses</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage your shipping addresses for faster checkout
          </p>
        </div>
        
        <AddressList addresses={addresses} />
      </div>
    </DashboardLayout>
  )
}
