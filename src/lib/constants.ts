// User role constants to match the string values used in the database
export const UserRole = {
  ADMIN: 'ADMIN',
  SELLER: 'SELLER', 
  DRIVER: 'DRIVER',
  BUYER: 'BUYER'
} as const

export type UserRoleType = typeof UserRole[keyof typeof UserRole]

// Simple string constants for easier usage
export const ADMIN = 'ADMIN'
export const SELLER = 'SELLER'
export const DRIVER = 'DRIVER'
export const BUYER = 'BUYER'

// Helper functions for role checking
export const isAdmin = (role: string): boolean => role === 'ADMIN'
export const isSeller = (role: string): boolean => role === 'SELLER'  
export const isDriver = (role: string): boolean => role === 'DRIVER'
export const isBuyer = (role: string): boolean => role === 'BUYER'

export const hasRole = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole)
}

export const getRoleName = (role: string): string => {
  switch (role) {
    case 'ADMIN':
      return 'Administrator'
    case 'SELLER':
      return 'Seller'
    case 'DRIVER':
      return 'Driver'
    case 'BUYER':
      return 'Buyer'
    default:
      return 'Unknown'
  }
}

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800'
    case 'SELLER':
      return 'bg-blue-100 text-blue-800'
    case 'DRIVER':
      return 'bg-green-100 text-green-800'
    case 'BUYER':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
