import { Suspense } from 'react'
import { Metadata } from 'next'
import SellerStorefront from '@/components/dashboard/seller/SellerStorefront'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Storefront Settings | Seller Dashboard',
  description: 'Manage your store profile and settings',
}

export default function SellerStorefrontPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Storefront Settings</h1>
            <p className="text-gray-600 mt-2">Manage your store profile and business information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <SellerStorefront />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
