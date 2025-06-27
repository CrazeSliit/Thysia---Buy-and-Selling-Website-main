import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Thysia',
  description: 'Welcome to your buyer dashboard'
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your buyer dashboard
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600">This feature is under development.</p>
        </div>
      </div>
    </div>
  )
}