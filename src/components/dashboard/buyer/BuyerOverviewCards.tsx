'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Heart, ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react'
import StatsCard from '@/components/ui/StatsCard'

interface BuyerStats {
  totalOrders: number
  pendingOrders: number
  wishlistItems: number
  cartItems: number
  totalSpent: number
  recentActivity: number
}

interface BuyerOverviewCardsProps {
  userId: string
}

export default function BuyerOverviewCards({ userId }: BuyerOverviewCardsProps) {
  const [stats, setStats] = useState<BuyerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/buyer/dashboard-overview')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching buyer stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statsConfig = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: `${stats.pendingOrders} pending`,
      changeType: 'neutral' as const,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Spent',
      value: `$${stats.totalSpent.toFixed(2)}`,
      change: `${stats.recentActivity} orders this month`,
      changeType: 'neutral' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Wishlist Items',
      value: stats.wishlistItems.toString(),
      change: 'Items saved for later',
      changeType: 'neutral' as const,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Cart Items',
      value: stats.cartItems.toString(),
      change: 'Ready to checkout',
      changeType: 'neutral' as const,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          color={stat.color}
          bgColor={stat.bgColor}
        />
      ))}
    </div>
  )
}
