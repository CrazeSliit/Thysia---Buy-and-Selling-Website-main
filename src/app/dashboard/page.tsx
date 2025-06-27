import { requireAuth } from '@/lib/auth-utils'
import { UserRoleType, UserRole } from '@/lib/constants'
import Link from 'next/link'
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  Users, 
  BarChart3, 
  Settings,
  Star,
  DollarSign 
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await requireAuth()
  const { user } = session

  const getDashboardContent = () => {
    switch (user.role) {
      case UserRole.ADMIN:
        return {
          title: 'Admin Dashboard',
          description: 'Manage your e-commerce platform',
          links: [
            { href: '/admin/users', label: 'Manage Users', icon: Users, description: 'View and manage all users' },
            { href: '/admin/products', label: 'All Products', icon: Package, description: 'Manage all products' },
            { href: '/admin/orders', label: 'All Orders', icon: ShoppingBag, description: 'View and manage orders' },
            { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, description: 'Platform analytics' },
            { href: '/admin/settings', label: 'Settings', icon: Settings, description: 'System settings' },
          ]
        }
      
      case UserRole.SELLER:
        return {
          title: 'Seller Dashboard',
          description: `Welcome back, ${user.sellerProfile?.businessName || user.name}!`,
          links: [
            { href: '/seller/products', label: 'My Products', icon: Package, description: 'Manage your products' },
            { href: '/seller/orders', label: 'Orders', icon: ShoppingBag, description: 'View customer orders' },
            { href: '/seller/analytics', label: 'Sales Analytics', icon: BarChart3, description: 'Track your sales' },
            { href: '/seller/profile', label: 'Store Profile', icon: Settings, description: 'Manage store settings' },
          ]
        }
      
      case UserRole.DRIVER:
        return {
          title: 'Driver Dashboard',
          description: 'Manage your deliveries',
          links: [
            { href: '/driver/deliveries', label: 'Available Deliveries', icon: Truck, description: 'View available jobs' },
            { href: '/driver/active', label: 'Active Deliveries', icon: Package, description: 'Current deliveries' },
            { href: '/driver/history', label: 'Delivery History', icon: BarChart3, description: 'Past deliveries' },
            { href: '/driver/profile', label: 'Profile', icon: Settings, description: 'Update your details' },
          ]
        }
      
      case UserRole.BUYER:
      default:
        return {
          title: 'My Dashboard',
          description: 'Manage your shopping experience',
          links: [
            { href: '/buyer/orders', label: 'My Orders', icon: ShoppingBag, description: 'Track your orders' },
            { href: '/buyer/wishlist', label: 'Wishlist', icon: Star, description: 'Saved products' },
            { href: '/buyer/addresses', label: 'Addresses', icon: Settings, description: 'Manage addresses' },
            { href: '/buyer/reviews', label: 'My Reviews', icon: Star, description: 'Products you\'ve reviewed' },
          ]
        }
    }
  }

  const dashboardData = getDashboardContent()

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            {dashboardData.title}
          </h1>
          <p className="text-secondary-600">
            {dashboardData.description}
          </p>
        </div>

        {/* User Info Card */}
        <div className="card p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">              <span className="text-primary-600 font-bold text-xl">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">{user.name}</h3>
              <p className="text-secondary-600">{user.email}</p>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' :
                  user.role === UserRole.SELLER ? 'bg-green-100 text-green-800' :
                  user.role === UserRole.DRIVER ? 'bg-blue-100 text-blue-800' :
                  'bg-secondary-100 text-secondary-800'
                }`}>
                  {user.role}
                </span>
                {user.sellerProfile && (
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.sellerProfile.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.sellerProfile.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                )}
                {user.driverProfile && (
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.driverProfile.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.driverProfile.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {dashboardData.links.map((link, index) => {
            const Icon = link.icon
            return (
              <Link
                key={index}
                href={link.href}
                className="card p-6 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                      {link.label}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h3>
          <div className="text-secondary-600 text-center py-8">
            <p>No recent activity to display.</p>
            <p className="text-sm mt-2">
              Start by{' '}
              {user.role === UserRole.BUYER && <Link href="/products" className="text-primary-600 hover:underline">browsing products</Link>}
              {user.role === UserRole.SELLER && <Link href="/seller/products/new" className="text-primary-600 hover:underline">adding a product</Link>}
              {user.role === UserRole.DRIVER && <Link href="/driver/deliveries" className="text-primary-600 hover:underline">checking for deliveries</Link>}
              {user.role === UserRole.ADMIN && <Link href="/admin/users" className="text-primary-600 hover:underline">managing users</Link>}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
