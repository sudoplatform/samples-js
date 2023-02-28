import React from 'react'
import { EmailMessage } from '@sudoplatform/sudo-email'

interface MailboxState {
  focusedEmailMessage: EmailMessage | null
  setFocusedEmailMessage: (emailMessage: EmailMessage | null) => void
}

export const MailboxContext = React.createContext<MailboxState>(
  undefined as never,
)
