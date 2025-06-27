import { UserRole } from "@/lib/constants"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }
  
  if (!session.user.isActive) {
    redirect("/auth/deactivated")
  }
  
  return session
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth()
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized")
  }
  
  return session
}

export async function requireBuyer() {
  return await requireRole([UserRole.BUYER])
}

export async function requireSeller() {
  return await requireRole([UserRole.SELLER])
}

export async function requireDriver() {
  return await requireRole([UserRole.DRIVER])
}

export async function requireAdmin() {
  return await requireRole([UserRole.ADMIN])
}

export async function requireSellerOrAdmin() {
  return await requireRole([UserRole.SELLER, UserRole.ADMIN])
}

export async function requireDriverOrAdmin() {
  return await requireRole([UserRole.DRIVER, UserRole.ADMIN])
}

export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}

export function isBuyer(userRole: string): boolean {
  return userRole === UserRole.BUYER
}

export function isSeller(userRole: string): boolean {
  return userRole === UserRole.SELLER
}

export function isDriver(userRole: string): boolean {
  return userRole === UserRole.DRIVER
}

export function isAdmin(userRole: string): boolean {
  return userRole === UserRole.ADMIN
}
