import 'antd/dist/antd.min.css'
import React, { useMemo, useState } from 'react'
import baseSdkConfig from '../config/sudoplatformconfig.json'
import { DefaultConfigurationManager } from '@sudoplatform/sudo-common'
import { DefaultLogger } from '@sudoplatform/sudo-common'
import {
  AuthenticationTokens,
  DefaultSudoUserClient,
} from '@sudoplatform/sudo-user'
import * as Pages from './pages'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CheckAuth } from './components/CheckAuth'
import { AuthContext } from './components/AuthContext'
import { createGlobalStyle } from 'styled-components'
import { DefaultApiClientManager } from '@sudoplatform/sudo-api-client'

const typedBaseSdkConfig = baseSdkConfig as Record<string, unknown>

// Add app-specific params to sdk config
const sdkConfig = {
  ...typedBaseSdkConfig,
}

const GlobalStyles = createGlobalStyle`
  body {
    background: #f6f6f6;
  }
`

/**
 * Main App component.
 * Configures auth context and routes.
 */
export const App: React.FC = () => {
  const [authTokens, setAuthTokens] = useState<AuthenticationTokens>()
  const userClient = useMemo(() => {
    try {
      // Configure configuration manager for Sudo Platform SDKs
      DefaultConfigurationManager.getInstance().setConfig(
        JSON.stringify(sdkConfig),
      )
      // Configure user client for auth
      const client = new DefaultSudoUserClient({
        logger: new DefaultLogger(),
      })
      DefaultApiClientManager.getInstance().setAuthClient(client)

      return client
    } catch (error) {
      console.error(error)
      throw new Error(
        `Could not create SudoUserClient.
          Please ensure your \`config/sudoplatformconfig.json\` is valid and up to date.
          See README.md for more info.`,
      )
    }
  }, [])

  return (
    <BrowserRouter>
      <AuthContext.Provider
        value={{
          userClient,
          authenticationTokens: authTokens,
          setAuthenticationTokens: setAuthTokens,
        }}
      >
        <GlobalStyles />
        <Routes>
          {/* Main app page */}
          <Route
            path="/virtual-cards/*"
            element={
              <CheckAuth>
                <Pages.VirtualCardsPage userClient={userClient} />
              </CheckAuth>
            }
          ></Route>

          {/* Sign in page */}
          <Route path="/sign-in" element={<Pages.SignInPage />}></Route>

          {/* Handlers that receive OpenID Connect tokens for auth */}
          <Route path="/callback" element={<Pages.AuthCallbackPage />}></Route>

          {/* Handlers that receive success/failure notification of 3ds */}
          <Route
            path="/checkout-3ds-success"
            element={<Pages.SuccessCallbackPage />}
          ></Route>
          <Route
            path="/checkout-3ds-failure"
            element={<Pages.FailureCallbackPage />}
          ></Route>

          {/* Default page */}
          <Route index element={<Navigate to="/virtual-cards" />} />
        </Routes>
      </AuthContext.Provider>
    </BrowserRouter>
  )
}
