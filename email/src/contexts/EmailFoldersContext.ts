import React from 'react'
import { EmailFolder } from '@sudoplatform/sudo-email'

interface EmailFoldersState {
  emailFolders: EmailFolder[]
  emailFoldersLoading: boolean
  listEmailFoldersHandler: () => void
  selectedEmailFolderId: string | null
  setSelectedEmailFolderId: (folderId: string | null) => void
}

export const EmailFoldersContext = React.createContext<EmailFoldersState>(
  undefined as never,
)
