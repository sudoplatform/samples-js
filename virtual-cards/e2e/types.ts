export type Person = {
  firstName: string
  lastName: string
  dateOfBirth: string
  sudo?: string
}

export type Address = {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type Card = {
  // cardHolder: string
  // alias: string
  cardNumber: string
  expiryDate: string
  securityCode: string
}
