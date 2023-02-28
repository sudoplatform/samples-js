import React from 'react'
import { AuthenticationTokens, SudoUserClient } from '@sudoplatform/sudo-user'

interface AuthState {
  sudoUserClient: SudoUserClient
  authenticationTokens: AuthenticationTokens | undefined
  setAuthenticationTokens: (authTokens: AuthenticationTokens) => void
}

export const AuthContext = React.createContext<AuthState>(undefined as never)
