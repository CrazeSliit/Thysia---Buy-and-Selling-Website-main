import { UserRoleType } from "@/lib/constants"
import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      isActive: boolean
      buyerProfile?: {
        id: string
      } | null
      sellerProfile?: {
        id: string
        businessName: string
        isVerified: boolean
      } | null
      driverProfile?: {
        id: string
        isAvailable: boolean
      } | null
    } & DefaultSession["user"]
  }  interface User extends DefaultUser {
    role: string
    isActive: boolean
    buyerProfile?: {
      id: string
    } | null
    sellerProfile?: {
      id: string
      businessName: string
      isVerified: boolean
    } | null
    driverProfile?: {
      id: string
      isAvailable: boolean
    } | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string
    isActive: boolean
    buyerProfile?: {
      id: string
    } | null
    sellerProfile?: {
      id: string
      businessName: string
      isVerified: boolean
    } | null
    driverProfile?: {
      id: string
      isAvailable: boolean
    } | null
  }
}
