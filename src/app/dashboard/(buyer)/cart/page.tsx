import { Metadata } from 'next'
import CartList from '@/components/dashboard/buyer/CartList'

export const metadata: Metadata = {
  title: 'Shopping Cart - Thysia',
  description: 'Review items in your shopping cart'
}

export default function CartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Shopping Cart</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review your items and proceed to checkout
        </p>
      </div>
      
      <CartList />
    </div>
  )
}
