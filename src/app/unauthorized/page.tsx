import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary-600 mb-4">403</h1>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h2>
          <p className="text-secondary-600">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="btn-primary w-full"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="btn-secondary w-full"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
