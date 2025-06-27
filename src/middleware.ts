import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token    // Public routes that don't require authentication
    const publicRoutes = [
      "/",
      "/products",
      "/categories",
      "/auth/signin",
      "/auth/signup",
      "/api/auth",
      "/api/products", // Allow public product API access
    ]

    // Check if current path is public
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route)
    )

    // Allow access to public routes
    if (isPublicRoute && !pathname.startsWith("/dashboard")) {
      return NextResponse.next()
    }

    // Require authentication for protected routes
    if (!token) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user account is active
    if (!token.isActive) {
      return NextResponse.redirect(new URL("/auth/deactivated", req.url))
    }    // Role-based route protection
    const userRole = token.role as string

    // Admin routes
    if (pathname.startsWith("/admin") && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }    // Seller routes
    if (pathname.startsWith("/seller") && userRole !== 'SELLER' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }    // Driver routes
    if (pathname.startsWith("/driver") && userRole !== 'DRIVER' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    // Dashboard routing based on role
    if (pathname === "/dashboard") {
      switch (userRole) {
        case 'ADMIN':
          return NextResponse.redirect(new URL("/dashboard/admin", req.url))
        case 'SELLER':
          return NextResponse.redirect(new URL("/dashboard/seller", req.url))
        case 'DRIVER':
          return NextResponse.redirect(new URL("/dashboard/driver", req.url))
        case 'BUYER':
          return NextResponse.redirect(new URL("/dashboard/buyer", req.url))
        default:
          return NextResponse.redirect(new URL("/", req.url))
      }
    }

    return NextResponse.next()
  },  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Always allow access to public routes and auth pages
        if (pathname.startsWith("/auth/") || 
            pathname === "/" || 
            pathname.startsWith("/products") ||
            pathname.startsWith("/categories") ||
            pathname.startsWith("/api/auth/")) {
          return true
        }

        // Allow authenticated API routes if user has token
        if (pathname.startsWith("/api/") && token) {
          return true
        }

        // For other routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/webhooks).*)",
  ],
}
