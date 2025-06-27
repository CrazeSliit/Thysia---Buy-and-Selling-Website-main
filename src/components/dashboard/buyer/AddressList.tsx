'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Address } from '@/types/address'
import { MapPin, Edit2, Trash2, Plus, Star, Building, Home, Briefcase } from 'lucide-react'

interface AddressListProps {
  addresses: Address[]
  onDelete?: (addressId: string) => Promise<void>
  onSetDefault?: (addressId: string) => Promise<void>
}

const ADDRESS_TYPE_ICONS = {
  HOME: Home,
  WORK: Briefcase,
  OTHER: Building,
}

export default function AddressList({ addresses, onDelete, onSetDefault }: AddressListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    setDeletingId(addressId)

    try {
      if (onDelete) {
        await onDelete(addressId)
      } else {
        const response = await fetch(`/api/user/addresses/${addressId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to delete address')
        }

        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete address')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    setSettingDefaultId(addressId)

    try {
      if (onSetDefault) {
        await onSetDefault(addressId)
      } else {
        const response = await fetch(`/api/user/addresses/${addressId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isDefault: true }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to set default address')
        }

        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to set default address')
    } finally {
      setSettingDefaultId(null)
    }
  }

  const formatAddress = (address: Address) => {
    const parts = [
      address.street,
      `${address.city}, ${address.state} ${address.zipCode}`,
      address.country !== 'US' ? address.country : null
    ].filter(Boolean)

    return parts.join('\n')
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">No addresses yet</h3>
        <p className="text-secondary-600 mb-6">
          Add your first shipping address to get started.
        </p>
        <Link
          href="/dashboard/buyer/addresses/new"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-secondary-900">
          Saved Addresses ({addresses.length})
        </h2>
        <Link
          href="/dashboard/buyer/addresses/new"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Link>
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => {
          return (
            <div
              key={address.id}
              className={`relative bg-white border rounded-lg p-6 ${
                address.isDefault ? 'border-primary-200 bg-primary-50' : 'border-secondary-200'
              }`}
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </span>
                </div>
              )}

              {/* Name */}
              <div className="mb-2">
                <h3 className="font-semibold text-secondary-900">
                  {address.fullName}
                </h3>
              </div>

              {/* Address */}
              <div className="mb-4">
                <pre className="text-sm text-secondary-700 whitespace-pre-wrap font-sans">
                  {formatAddress(address)}
                </pre>
                {address.phone && (
                  <p className="text-sm text-secondary-600 mt-1">{address.phone}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/buyer/addresses/${address.id}/edit`}
                    className="inline-flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-500"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {deletingId === address.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>

                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    disabled={settingDefaultId === address.id}
                    className="text-sm text-secondary-600 hover:text-secondary-500 disabled:opacity-50"
                  >
                    {settingDefaultId === address.id ? 'Setting...' : 'Set as Default'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
