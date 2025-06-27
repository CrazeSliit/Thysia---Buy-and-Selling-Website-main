import { Suspense } from 'react'
import { Metadata } from 'next'
import CartList from '@/components/dashboard/buyer/CartList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Shopping Cart | Buyer Dashboard',
  description: 'Manage your shopping cart items',
}

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">Review and manage your cart items</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cart Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <CartList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
