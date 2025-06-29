import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AddressForm from '@/components/dashboard/buyer/AddressForm'
import { Address } from '@/types/address'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface EditAddressPageProps {
  params: {
    id: string
  }
}

async function getAddress(addressId: string, userId: string): Promise<Address | null> {
  try {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        buyer: {
          userId: userId
        }
      }
    })

    if (!address) {
      return null
    }    // Convert dates to strings for serialization
    return {
      ...address,
      type: address.type as 'HOME' | 'WORK' | 'OTHER',
      company: address.company || undefined, // Convert null to undefined
      createdAt: address.createdAt.toISOString(),
      updatedAt: address.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching address:', error)
    return null
  }
}

export default async function EditAddressPage({ params }: EditAddressPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'BUYER') {
    redirect('/unauthorized')
  }

  const address = await getAddress(params.id, session.user.id)

  if (!address) {
    notFound()
  }

  // Debug: Log the address data structure
  console.log('Address data for editing:', address)

  return (
    <DashboardLayout userRole="BUYER">
      <div className="space-y-6">
        <div className="border-b border-secondary-200 pb-4">
          <h1 className="text-2xl font-bold text-secondary-900">Edit Address</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Update your shipping address details
          </p>
        </div>
        
        <AddressForm address={address} isEditing={true} />
      </div>
    </DashboardLayout>
  )
}
