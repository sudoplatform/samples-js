import { AuthenticationTokens, SudoUserClient } from '@sudoplatform/sudo-user'
import React from 'react'

interface Auth {
  userClient: SudoUserClient
  authenticationTokens: AuthenticationTokens | undefined
  setAuthenticationTokens: (authTokens: AuthenticationTokens) => void
}

/**
 * Context used for authenticating in the Virtual Cards Sample Application.
 */
export const AuthContext = React.createContext<Auth>(undefined as never)
