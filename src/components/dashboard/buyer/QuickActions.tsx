import Link from 'next/link'
import { ShoppingCart, Heart, MapPin, Settings } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      title: 'Continue Shopping',
      description: 'Browse our latest products',
      href: '/products',
      icon: ShoppingCart,
      bgColor: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      title: 'View Wishlist',
      description: 'Check your saved items',
      href: '/dashboard/buyer/wishlist',
      icon: Heart,
      bgColor: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
    },
    {
      title: 'Manage Addresses',
      description: 'Update shipping addresses',
      href: '/dashboard/buyer/addresses',
      icon: MapPin,
      bgColor: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      title: 'Account Settings',
      description: 'Update your profile',
      href: '/dashboard/buyer/settings',
      icon: Settings,
      bgColor: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`p-4 rounded-lg text-white ${action.bgColor} ${action.hoverColor} transition-colors duration-200 group`}
            >
              <div className="flex items-center mb-2">
                <Icon className="w-5 h-5 mr-2" />
                <span className="font-medium">{action.title}</span>
              </div>
              <p className="text-sm opacity-90">{action.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
