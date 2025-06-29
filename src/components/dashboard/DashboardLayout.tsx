'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  User, 
  ShoppingBag, 
  Package, 
  Truck, 
  Settings, 
  Menu, 
  X,
  Home,
  Heart,
  MapPin,
  Star,
  MessageSquare,
  ChevronDown,
  LogOut,
  ShoppingCart
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: string
}

const navigationConfig = {
  BUYER: [
    { href: '/dashboard/buyer', label: 'Overview', icon: Home },
    { href: '/dashboard/buyer/orders', label: 'My Orders', icon: ShoppingBag },
    { href: '/dashboard/buyer/cart', label: 'Shopping Cart', icon: ShoppingCart },
    { href: '/dashboard/buyer/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/dashboard/buyer/addresses', label: 'Addresses', icon: MapPin },
    { href: '/dashboard/buyer/reviews', label: 'My Reviews', icon: Star },
    { href: '/dashboard/buyer/inbox', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/buyer/settings', label: 'Settings', icon: Settings },
  ],
  SELLER: [
    { href: '/dashboard/seller', label: 'Overview', icon: Home },
    { href: '/dashboard/seller/products', label: 'Products', icon: Package },
    { href: '/dashboard/seller/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/dashboard/seller/reports', label: 'Reports', icon: Star },
  ],
  DRIVER: [
    { href: '/dashboard/driver', label: 'Overview', icon: Home },
    { href: '/dashboard/driver/shipments', label: 'Shipments', icon: Truck },
    { href: '/dashboard/driver/earnings', label: 'Earnings', icon: User },
  ],
  ADMIN: [
    { href: '/dashboard/admin', label: 'Overview', icon: Home },
    { href: '/dashboard/admin/users', label: 'Users', icon: User },
    { href: '/dashboard/admin/products', label: 'Products', icon: Package },
    { href: '/dashboard/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/dashboard/admin/shipments', label: 'Shipments', icon: Truck },
  ],
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()

  const navigation = navigationConfig[userRole as keyof typeof navigationConfig] || []

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <span className="text-xl font-bold text-primary-600">Thysia</span>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium mb-1 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r shadow-sm">
          <div className="flex items-center h-16 px-4 border-b">
            <Link href="/" className="text-xl font-bold text-primary-600">
              Thysia
            </Link>
          </div>
          <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium mb-1 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          {/* User profile section */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-secondary-900">{session?.user?.name}</p>
                <p className="text-xs text-secondary-500 capitalize">{userRole.toLowerCase()}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 p-1 text-secondary-400 hover:text-secondary-600"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white border-b shadow-sm">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-lg font-semibold">Dashboard</span>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
