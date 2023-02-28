import React from 'react'
import { EmailAddress } from '@sudoplatform/sudo-email'
import { BoundaryErrorObject } from '@components/ErrorBoundary/ErrorBoundary'

interface EmailState {
  activeEmailAddress?: EmailAddress
  setActiveEmailAddress: (emailAddress?: EmailAddress) => void
  emailAddresses: EmailAddress[]
  emailAddressesLoading: boolean
  emailAddressesError?: BoundaryErrorObject
  listEmailAddressesHandler: () => void
}

export const EmailContext = React.createContext<EmailState>(undefined as never)
