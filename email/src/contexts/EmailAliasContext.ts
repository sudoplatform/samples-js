import React from 'react'
import { EmailAlias } from '@sudoplatform/sudo-email'
import { BoundaryErrorObject } from '@components/ErrorBoundary/ErrorBoundary'

interface EmailAliasState {
  emailAliases: EmailAlias[]
  emailAliasesLoading: boolean
  emailAliasesError?: BoundaryErrorObject
  listEmailAliasesHandler: () => void
}

export const EmailAliasContext = React.createContext<EmailAliasState>(
  undefined as never,
)
