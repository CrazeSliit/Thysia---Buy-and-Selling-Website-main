'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AddressFormData, Address } from '@/types/address'
import { MapPin, Building, Home, Briefcase } from 'lucide-react'

interface AddressFormProps {
  address?: Address
  isEditing?: boolean
  onSubmit?: (data: AddressFormData) => Promise<void>
  onCancel?: () => void
}

const ADDRESS_TYPES = [
  { value: 'HOME', label: 'Home', icon: Home },
  { value: 'WORK', label: 'Work', icon: Briefcase },
  { value: 'OTHER', label: 'Other', icon: Building },
] as const

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function AddressForm({ address, isEditing = false, onSubmit, onCancel }: AddressFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Parse existing address data for editing
  const parseAddressData = (address: Address | undefined): AddressFormData => {
    if (!address) {
      return {
        type: 'HOME',
        firstName: '',
        lastName: '',
        company: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
        phone: '',
        isDefault: false,
      }
    }

    // Parse fullName into first and last name
    const nameParts = address.fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Parse street into address1 and address2
    const streetParts = address.street.split(',').map(part => part.trim())
    const address1 = streetParts[0] || ''
    const address2 = streetParts.slice(1).join(', ') || ''

    return {
      type: address.type || 'HOME',
      firstName,
      lastName,
      company: address.company || '', // Now stored in database
      address1,
      address2,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    }
  }

  const [formData, setFormData] = useState<AddressFormData>(parseAddressData(address))

  // Update form data when address prop changes (for async loading)
  useEffect(() => {
    console.log('AddressForm received address:', address)
    console.log('Parsed form data:', parseAddressData(address))
    setFormData(parseAddressData(address))
  }, [address])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Default API call
        const url = isEditing ? `/api/user/addresses/${address?.id}` : '/api/user/addresses'
        const method = isEditing ? 'PUT' : 'POST'

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save address')
        }

        router.push('/dashboard/buyer/addresses')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/dashboard/buyer/addresses')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Address Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-secondary-700 mb-3">
            Address Type *
          </label>
          <div className="grid grid-cols-3 gap-4">
            {ADDRESS_TYPES.map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={`
                  flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${formData.type === value 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="type"
                  value={value}
                  checked={formData.type === value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-secondary-700">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="mt-1 input-field"
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-secondary-700">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              className="mt-1 input-field"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-secondary-700">
            Company (Optional)
          </label>
          <input
            type="text"
            id="company"
            name="company"
            className="mt-1 input-field"
            value={formData.company}
            onChange={handleInputChange}
          />
        </div>

        {/* Address Fields */}
        <div>
          <label htmlFor="address1" className="block text-sm font-medium text-secondary-700">
            Address Line 1 *
          </label>
          <input
            type="text"
            id="address1"
            name="address1"
            required
            className="mt-1 input-field"
            placeholder="Street address"
            value={formData.address1}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="address2" className="block text-sm font-medium text-secondary-700">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            id="address2"
            name="address2"
            className="mt-1 input-field"
            placeholder="Apartment, suite, etc."
            value={formData.address2}
            onChange={handleInputChange}
          />
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-secondary-700">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              className="mt-1 input-field"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-secondary-700">
              State *
            </label>
            <select
              id="state"
              name="state"
              required
              className="mt-1 input-field"
              value={formData.state}
              onChange={handleInputChange}
            >
              <option value="">Select State</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-secondary-700">
              ZIP Code *
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              required
              className="mt-1 input-field"
              value={formData.zipCode}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-secondary-700">
            Country *
          </label>
          <select
            id="country"
            name="country"
            required
            className="mt-1 input-field"
            value={formData.country}
            onChange={handleInputChange}
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="MX">Mexico</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-secondary-700">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="mt-1 input-field"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>

        {/* Default Address */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            checked={formData.isDefault}
            onChange={handleInputChange}
          />
          <label htmlFor="isDefault" className="ml-2 block text-sm text-secondary-700">
            Set as default address
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Address' : 'Add Address'}
          </button>
        </div>
      </form>
    </div>
  )
}
