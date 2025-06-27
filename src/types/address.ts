export interface Address {
  id: string
  buyerId: string
  fullName: string
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
  firstName: string
  lastName: string
  company: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
}
