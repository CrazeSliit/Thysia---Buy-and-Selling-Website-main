'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Edit, Trash2, Eye, Package, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  stock: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
  }
  _count: {
    reviews: number
    orderItems: number
  }
}

interface ProductsResponse {
  products: Product[]
}

export default function SellerProductsList() {
  const [productsData, setProductsData] = useState<ProductsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/seller/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProductsData(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    setDeletingProduct(productId)
    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      const result = await response.json()
      await fetchProducts()
      toast.success(result.message)
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    } finally {
      setDeletingProduct(null)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update product status')
      }

      await fetchProducts()
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Error updating product status:', error)
      toast.error('Failed to update product status')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!productsData || productsData.products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
        <p className="text-gray-600 mb-4">Create your first product to start selling</p>
        <Link href="/dashboard/seller/products/new">
          <Button>Add Your First Product</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Products</h3>
          <p className="text-2xl font-bold text-blue-900">{productsData.products.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Active Products</h3>
          <p className="text-2xl font-bold text-green-900">
            {productsData.products.filter(p => p.isActive).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Featured Products</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {productsData.products.filter(p => p.isFeatured).length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Total Orders</h3>
          <p className="text-2xl font-bold text-purple-900">
            {productsData.products.reduce((sum, p) => sum + p._count.orderItems, 0)}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsData.products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 relative h-48 w-full overflow-hidden">
                <Image
                  src={product.imageUrl || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-2 left-2 flex flex-col space-y-1">
                <Badge variant={product.isActive ? 'default' : 'destructive'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {product.isFeatured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="outline">
                  {product.stock} in stock
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {product.category.name}
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Star className="h-4 w-4" />
                    <span>{product._count.reviews} reviews</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Orders: {product._count.orderItems}</span>
                  <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Link href={`/products/${product.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  
                  <Link href={`/dashboard/seller/products/${product.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant={product.isActive ? "destructive" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={() => toggleProductStatus(product.id, product.isActive)}
                  >
                    {product.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                    disabled={deletingProduct === product.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
