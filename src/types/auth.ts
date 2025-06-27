import { UserRoleType } from '@/lib/constants'

export interface User {
  id: string
  name?: string | null
  email: string
  image?: string | null
  role: string
  isActive: boolean
}

export interface AuthUser extends User {
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
