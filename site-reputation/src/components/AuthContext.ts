import { SudoUserClient } from '@sudoplatform/sudo-user'
import React from 'react'

export const AuthContext = React.createContext<{ userClient: SudoUserClient }>(
  undefined as never,
)
