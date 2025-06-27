import { Suspense } from 'react'
import { ShoppingBag, Heart, Star, Package } from 'lucide-react'
import Link from 'next/link'
import RecentOrders from './RecentOrders'
import QuickActions from './QuickActions'

interface BuyerOverviewProps {
  userId: string
}

// Loading component for async data
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-secondary-200 rounded"></div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-secondary-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Quick stats component - This will be fetched from API
async function QuickStats({ userId }: { userId: string }) {
  // For now, we'll show placeholder data
  // TODO: Fetch real data from API
  const stats = [
    {
      title: 'Total Orders',
      value: '12',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Wishlist Items',
      value: '8',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Reviews Written',
      value: '5',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Pending Deliveries',
      value: '2',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function BuyerOverview({ userId }: BuyerOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <Suspense fallback={<StatsLoading />}>
        <QuickStats userId={userId} />
      </Suspense>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900">Recent Orders</h2>
            <Link 
              href="/dashboard/buyer/orders"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
        </div>
        <Suspense fallback={<div className="p-6">Loading orders...</div>}>
          <RecentOrders userId={userId} />
        </Suspense>
      </div>
    </div>
  )
}
