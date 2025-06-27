import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SellerProductsList from '@/components/dashboard/seller/SellerProductsList'
import { Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Product Management | Seller Dashboard',
  description: 'Manage your products inventory',
}

export default function SellerProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-2">Manage your products inventory</p>
          </div>
          <Link href="/dashboard/seller/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <SellerProductsList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
