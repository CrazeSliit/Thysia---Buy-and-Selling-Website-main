'use client'

import { useState, Suspense } from 'react'
import { DollarSign, Truck, Clock, CheckCircle, MapPin, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'
import ActiveDelivery from './ActiveDelivery'
import PendingDeliveries from './PendingDeliveries'

interface DriverOverviewProps {
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

// Availability toggle component
function AvailabilityToggle() {
  const [isAvailable, setIsAvailable] = useState(true)

  const handleToggle = () => {
    setIsAvailable(!isAvailable)
    // TODO: Update availability in backend
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-secondary-900">Availability Status</h2>
          <p className="text-sm text-secondary-600 mt-1">
            Toggle your availability to receive new delivery requests
          </p>
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            isAvailable ? 'bg-green-500' : 'bg-secondary-300'
          }`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            isAvailable ? 'translate-x-7' : 'translate-x-1'
          }`} />
        </button>
      </div>
      <div className="mt-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-secondary-100 text-secondary-800'
        }`}>
          {isAvailable ? 'Available for deliveries' : 'Offline'}
        </span>
      </div>
    </div>
  )
}

// Quick stats component
async function QuickStats({ userId }: { userId: string }) {
  // For now, we'll show placeholder data
  // TODO: Fetch real data from API
  const stats = [
    {
      title: 'Today\'s Earnings',
      value: '$125.50',
      change: '+$12.50',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Deliveries Today',
      value: '8',
      change: '+2',
      changeType: 'positive' as const,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Pickups',
      value: '3',
      change: '0',
      changeType: 'neutral' as const,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Completed This Week',
      value: '42',
      change: '+5',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>                <p className={`text-sm ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600' 
                    : 'text-secondary-500'
                }`}>
                  {stat.change !== '0' ? `${stat.change} from yesterday` : 'No change'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function DriverOverview({ userId }: DriverOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Availability Toggle */}
      <AvailabilityToggle />

      {/* Quick Stats */}
      <Suspense fallback={<StatsLoading />}>
        <QuickStats userId={userId} />
      </Suspense>

      {/* Current Delivery and Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Delivery */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-secondary-900">Current Delivery</h2>
          </div>
          <Suspense fallback={<div className="p-6">Loading current delivery...</div>}>
            <ActiveDelivery userId={userId} />
          </Suspense>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Pending Requests</h2>
              <Link 
                href="/dashboard/driver/shipments"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
          </div>
          <Suspense fallback={<div className="p-6">Loading pending deliveries...</div>}>
            <PendingDeliveries userId={userId} />
          </Suspense>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-secondary-900">Weekly Earnings</h2>
        </div>
        <Suspense fallback={<div className="p-6">Loading earnings chart...</div>}>
          <div className="p-6">
            <p className="text-secondary-600">Earnings chart coming soon...</p>
          </div>
        </Suspense>
      </div>
    </div>
  )
}
