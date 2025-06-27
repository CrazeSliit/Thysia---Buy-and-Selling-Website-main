import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Addresses - Thysia',
  description: 'Manage your shipping addresses'
}

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Addresses</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your shipping addresses for faster checkout
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
          <p className="text-gray-600 mb-4">Add your first shipping address to get started.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Add New Address
          </button>
        </div>
      </div>
    </div>
  )
}
