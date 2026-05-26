import React from 'react'
import { EmailMask } from '@sudoplatform/sudo-email'
import { BoundaryErrorObject } from '@components/ErrorBoundary/ErrorBoundary'

interface EmailMaskState {
  emailMasks: EmailMask[]
  emailMasksLoading: boolean
  emailMasksError?: BoundaryErrorObject
  listEmailMasksHandler: () => void
}

export const EmailMaskContext = React.createContext<EmailMaskState>(
  undefined as never,
)
