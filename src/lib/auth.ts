import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { UserRoleType } from "@/lib/constants"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            buyerProfile: true,
            sellerProfile: true,
            driverProfile: true
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        if (!user.isActive) {
          throw new Error("Account has been deactivated. Please contact support.")
        }        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isActive: user.isActive,
          buyerProfile: user.buyerProfile ? {
            id: user.buyerProfile.id
          } : null,
          sellerProfile: user.sellerProfile ? {
            id: user.sellerProfile.id,
            businessName: user.sellerProfile.businessName || '',
            isVerified: user.sellerProfile.isVerified
          } : null,
          driverProfile: user.driverProfile ? {
            id: user.driverProfile.id,
            isAvailable: user.driverProfile.isAvailable
          } : null
        }
      }
    }),  ],
  callbacks: {    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.isActive = user.isActive
        token.buyerProfile = user.buyerProfile
        token.sellerProfile = user.sellerProfile  
        token.driverProfile = user.driverProfile
      }

      // Handle session update
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRoleType
        session.user.isActive = token.isActive as boolean
        session.user.buyerProfile = token.buyerProfile as any
        session.user.sellerProfile = token.sellerProfile as any
        session.user.driverProfile = token.driverProfile as any      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // If user is signing in, redirect to their appropriate dashboard
      if (url === baseUrl || url === baseUrl + '/') {
        return `${baseUrl}/dashboard`
      }
      // If the url is relative, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }
      return `${baseUrl}/dashboard`
    }
  },
  pages: {
    signIn: "/auth/signin",  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Send welcome notification or email
      }
    }
  }
}
