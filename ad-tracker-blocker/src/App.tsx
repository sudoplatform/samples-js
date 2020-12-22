import React, { useMemo } from 'react'
import baseSdkConfig from '../config/sudoplatformconfig.json'
import { DefaultConfigurationManager } from '@sudoplatform/sudo-common'
import { createBunyanLogger } from '@sudoplatform/sudo-common/lib/logging/bunyanLogger'
import { DefaultSudoUserClient } from '@sudoplatform/sudo-user'
import * as Pages from './pages'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import { CheckAuth } from './components/CheckAuth'
import { AuthContext } from './components/AuthContext'
import { HSpace } from '@sudoplatform/web-ui'
import styled, { createGlobalStyle } from 'styled-components'

const typedBaseSdkConfig = baseSdkConfig as Record<string, unknown>

// Add app-specific params to sdk config
const sdkConfig = {
  ...typedBaseSdkConfig,
  federatedSignIn: {
    ...(typedBaseSdkConfig.federatedSignIn as Record<string, unknown>),
    signInRedirectUri: 'http://localhost:3000/callback',
    signOutRedirectUri: 'http://localhost:3000/callback',
    identityProvider: 'Auth0',
  },
}

const GlobalStyles = createGlobalStyle`
  body {
    background: #f6f6f6;
  }
`

const Container = styled(HSpace)`
  width: 100%;
`

const CenteredContent = styled.div`
  max-width: 600px;
  padding: 30px;
  width: 100%;
`

/**
 * Main App component.
 * Configures auth context and routes.
 */
export const App: React.FC = () => {
  const userClient = useMemo(() => {
    try {
      // Configure configuration manager for Sudo Platform SDKs
      DefaultConfigurationManager.getInstance().setConfig(
        JSON.stringify(sdkConfig),
      )

      // Configure user client for auth
      return new DefaultSudoUserClient(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        createBunyanLogger(),
      )
    } catch (error) {
      console.error(error)
      throw new Error(
        'Could not create SudoUserClient. ' +
          'Please ensure your `config/sudoplatformconfig.json` is valid and up to date. ' +
          'See README.md for more info.',
      )
    }
  }, [])

  return (
    <BrowserRouter>
      <AuthContext.Provider value={{ userClient }}>
        <GlobalStyles />
        <Container horizontalAlign="center">
          <CenteredContent>
            <h1>Ad/Tracker Blocker Sample</h1>

            <Switch>
              {/* Main app page */}
              <Route path="/ad-tracker-blocker">
                <CheckAuth>
                  <Pages.AdTrackerBlockerPage userClient={userClient} />
                </CheckAuth>
              </Route>

              {/* Sign in page */}
              <Route path="/sign-in" component={Pages.SignInPage} />

              {/* Handlers that receive OpenID Connect tokens for auth */}
              <Route path="/callback" component={Pages.AuthCallbackPage} />

              {/* Default page */}
              <Redirect to="/ad-tracker-blocker" />
            </Switch>
          </CenteredContent>
        </Container>
      </AuthContext.Provider>
    </BrowserRouter>
  )
}
