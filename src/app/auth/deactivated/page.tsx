import Link from 'next/link'

export default function DeactivatedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 14c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Account Deactivated</h2>
          <p className="text-secondary-600 mb-6">
            Your account has been temporarily deactivated. Please contact our support team for assistance.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/contact"
            className="btn-primary w-full"
          >
            Contact Support
          </Link>
          <Link
            href="/"
            className="btn-secondary w-full"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
