import Link from 'next/link'
import { ShoppingCart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <ShoppingCart className="w-24 h-24 text-secondary-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-secondary-600 text-lg">
            The product you're looking for doesn't exist or may have been removed.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/products">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse All Products
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
