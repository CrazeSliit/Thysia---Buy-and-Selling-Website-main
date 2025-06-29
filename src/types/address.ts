export interface Address {
  id: string
  buyerId: string
  type: 'HOME' | 'WORK' | 'OTHER'
  fullName: string
  company?: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAddressRequest {
  type: 'HOME' | 'WORK' | 'OTHER'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  isDefault?: boolean
}

export interface UpdateAddressRequest extends CreateAddressRequest {
  id: string
}

export interface AddressFormData {
  type: 'HOME' | 'WORK' | 'OTHER'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
}
