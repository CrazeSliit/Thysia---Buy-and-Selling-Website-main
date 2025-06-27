import Link from 'next/link'
import { ArrowRight, Shield, Truck, Users, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-custom py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-yellow-300">Thysia</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Your premium e-commerce marketplace connecting buyers, sellers, and drivers worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
              >
                Start Shopping
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
              >
                Join Thysia
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Why Choose Thysia?
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Experience the future of e-commerce with our comprehensive marketplace platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-secondary-600">
                Your transactions are protected with enterprise-grade security and encryption
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-secondary-600">
                Professional drivers ensure your orders arrive quickly and safely
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Sellers</h3>
              <p className="text-secondary-600">
                All our sellers are thoroughly vetted to ensure quality and reliability
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-secondary-600">
                Discover premium products from trusted sellers with verified reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Sections */}
      <section className="py-20 bg-secondary-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Buyers */}
            <div className="card p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Buyers</h3>
              <p className="text-secondary-600 mb-6">
                Discover amazing products from verified sellers with secure payments and fast delivery
              </p>
              <Link href="/products" className="btn-primary w-full">
                Start Shopping
              </Link>
            </div>

            {/* Sellers */}
            <div className="card p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Sellers</h3>
              <p className="text-secondary-600 mb-6">
                Reach millions of customers and grow your business with our powerful seller tools
              </p>
              <Link href="/auth/signup?role=seller" className="btn-primary w-full">
                Start Selling
              </Link>
            </div>

            {/* Drivers */}
            <div className="card p-8 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Drivers</h3>
              <p className="text-secondary-600 mb-6">
                Earn money on your schedule by delivering packages in your area
              </p>
              <Link href="/auth/signup?role=driver" className="btn-primary w-full">
                Drive & Earn
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-primary-200">Active Buyers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5K+</div>
              <div className="text-primary-200">Verified Sellers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1K+</div>
              <div className="text-primary-200">Professional Drivers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-primary-200">Products Sold</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
