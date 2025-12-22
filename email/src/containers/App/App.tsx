import React, { useMemo, useState } from 'react'
import { AuthContext } from '@contexts/index'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppContainer } from './App.styled'
import { AuthenticationTokens } from '@sudoplatform/sudo-user'
import { CheckAuth } from '@components/CheckAuth'
import { Project } from '@containers/Project'
import { SignInPage } from '@pages/SignInPage'
import { AuthCallbackPage } from '@pages/AuthCallbackPage'
import { DefaultConfigurationManager } from '@sudoplatform/sudo-common'
import { DefaultSudoUserClient } from '@sudoplatform/sudo-user'
import { DefaultLogger } from '@sudoplatform/sudo-common'
import { DefaultApiClientManager } from '@sudoplatform/sudo-api-client'
import { createGlobalStyle } from 'styled-components'

// Import sdk config and cast to object.
const sdkConfig = require('@config/sudoplatformconfig.json') as Record<
  string,
  unknown
>

const GlobalStyles = createGlobalStyle`
  body {
    background: #f6f6f6;
  }
`
/**
 * Returns a sudo user client instance from a given Sudo Platform SDK config.
 */
const initUserClient = (sdkConfig: string): DefaultSudoUserClient => {
  try {
    DefaultConfigurationManager.getInstance().setConfig(sdkConfig)

    const sudoUserClient = new DefaultSudoUserClient({
      logger: new DefaultLogger(),
    })

    DefaultApiClientManager.getInstance().setAuthClient(sudoUserClient)

    return sudoUserClient
  } catch (error) {
    console.error(error)
    throw new Error(
      `Could not create SudoUserClient.
        Please ensure your \`config/sudoplatformconfig.json\` is valid and up to date.
        See README.md for more info.`,
    )
  }
}
if (process.env.NODE_ENV === 'development') {
  // Suppress specific React errors and warnings
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  const ignoredStrings: string[] = [
    'findDOMNode is deprecated',
    'trigger element and popup element should in same shadow root',
  ]

  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      ignoredStrings.some((ignored) => (args[0] as string).includes(ignored))
    ) {
      return // Ignore these specific errors
    }
    originalConsoleError.apply(console, args)
  }

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      ignoredStrings.some((ignored) => (args[0] as string).includes(ignored))
    ) {
      return // Ignore these specific warnings
    }
    originalConsoleWarn.apply(console, args)
  }
}
/**
 * The <App> container provides the minimum context needed
 * to launch the app, including the environment config
 * (obtained via `sudoplatformconfig.json`), and register
 * key config (`register_key.id` and `register_key.private`)
 * needed for sign in.
 *
 * There is no access to the Sudo user clients at the
 * App container level. This is provided further down
 * in the container heirarchy (see <Project>).
 */
export const App = (): React.ReactElement => {
  const [authenticationTokens, setAuthenticationTokens] =
    useState<AuthenticationTokens>()

  const sudoUserClient = useMemo(() => {
    return initUserClient(JSON.stringify(sdkConfig))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        sudoUserClient,
        authenticationTokens,
        setAuthenticationTokens,
      }}
    >
      <BrowserRouter>
        {React.createElement(GlobalStyles as React.ComponentType)}
        <AppContainer>
          <Routes>
            <Route
              path="/*"
              element={
                <CheckAuth>
                  <Project sudoUserClient={sudoUserClient} />
                </CheckAuth>
              }
            />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/callback" element={<AuthCallbackPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AppContainer>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
