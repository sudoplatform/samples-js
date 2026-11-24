import React, { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Modal, Select, Switch, Typography } from 'antd'
import { AuthContext } from '@contexts/index'
import { ErrorFeedback } from '@components/ErrorFeedback'
import { authenticateWithRegisterKey } from './authenticate'
import { Button } from '@components/Button'
import {
  PageContainer,
  StyledCard,
  ContentContainer,
  StyledHeading,
} from './SignInPage.styled'
import {
  getEnforceSingletonPublicKey,
  getUsedFederatedSignIn,
  setEnforceSingletonPublicKey,
  setUsedFederatedSignIn,
} from '@services/session'
import {
  deregister,
  federatedSignInConfigProblem,
  signOutFederated,
} from '@services/signOut'
import { describeError } from '@util/format'
import registerKeyUrl from '@config/register_key.private?url'
import registerKeyIdUrl from '@config/register_key.id?url'

const { Text } = Typography

type AuthMethod = 'TEST' | 'FSSO'

export const SignInPage = (): React.ReactElement => {
  const { sudoUserClient, setAuthenticationTokens } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  // Kept for this visit only: the history entry's flag is cleared, so a reload doesn't show the notice again.
  const [sessionExpired] = useState(
    (location.state as { sessionExpired?: boolean } | null)?.sessionExpired ===
      true,
  )
  useEffect(() => {
    if (sessionExpired) window.history.replaceState({}, '', '/sign-in')
  }, [sessionExpired])

  const [signInMethod, setSignInMethod] = useState<AuthMethod>(
    getUsedFederatedSignIn() ? 'FSSO' : 'TEST',
  )
  const [singleKey, setSingleKey] = useState(getEnforceSingletonPublicKey())
  const [isRegistered, setIsRegistered] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<Error | null>(null)
  const [deregisterError, setDeregisterError] = useState<string>()
  const usedFsso = getUsedFederatedSignIn()

  useEffect(() => {
    const resume = async () => {
      // Skip straight into the app when already signed in.
      if (await sudoUserClient.isSignedIn()) {
        void navigate('/', { replace: true })
        return
      }
      setIsRegistered(await sudoUserClient.isRegistered())
    }
    void resume()
  }, [sudoUserClient, navigate])

  const handleSingleKeyChange = (checked: boolean) => {
    setSingleKey(checked)
    setEnforceSingletonPublicKey(checked)
  }

  const handleSignIn = async () => {
    setAuthError(null)
    if (signInMethod === 'FSSO') {
      // Federated sign in needs a `federatedSignIn` section in sudoplatformconfig.json.
      const configProblem = federatedSignInConfigProblem()
      if (configProblem) {
        setAuthError(new Error(configProblem))
        return
      }
      try {
        // Sends the browser to the sign in page, which redirects to /callback with the result.
        sudoUserClient.presentFederatedSignInUI()
      } catch (err) {
        console.error('Federated sign-in error:', err)
        setAuthError(err as Error)
      }
      return
    }
    setAuthLoading(true)
    try {
      const authTokens = await authenticateWithRegisterKey(
        registerKeyUrl,
        registerKeyIdUrl,
        sudoUserClient,
      )
      setUsedFederatedSignIn(false)
      setAuthenticationTokens(authTokens)
      void navigate('/')
    } catch (err) {
      console.error('Sign-in error:', err)
      setAuthError(err as Error)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleFederatedSignOut = async () => {
    setDeregisterError(undefined)
    try {
      // Sends the browser to the sign in provider to clear its cookies, so nothing after this runs.
      await signOutFederated(sudoUserClient)
    } catch (err) {
      console.error('Sign out error:', err)
      setDeregisterError(`Unable to sign out: ${describeError(err)}`)
    }
  }

  const handleDeregister = () => {
    Modal.confirm({
      title: 'Deregister?',
      content:
        'Are you sure you want to deregister? All Sudos and associated data will be deleted.',
      okText: 'Deregister',
      okButtonProps: { danger: true },
      onOk: async () => {
        setDeregisterError(undefined)
        try {
          await deregister(sudoUserClient)
          setIsRegistered(false)
        } catch (err) {
          console.error('Deregister error:', err)
          setDeregisterError(`Unable to deregister: ${describeError(err)}`)
        }
      },
    })
  }

  return (
    <PageContainer>
      <ContentContainer>
        <StyledHeading>Email Sample</StyledHeading>
        <StyledCard title="Sign in" className="sign-in-card">
          <p>
            For more information about how to configure the different sign-in
            methods in this application, see{' '}
            <a
              href="https://docs.sudoplatform.com/guides/users/registration"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
            .
          </p>
          <p>Please select a sign in method:</p>
          <Select
            className="sign-in-method"
            style={{ minWidth: 200 }}
            value={signInMethod}
            popupMatchSelectWidth={false}
            onChange={(value) => setSignInMethod(value)}
            options={[
              { label: 'TEST Registration', value: 'TEST' },
              { label: 'Federated SignIn', value: 'FSSO' },
            ]}
          />
          <div style={{ margin: '20px 0' }}>
            <Switch
              checked={singleKey}
              onChange={handleSingleKeyChange}
              disabled={authLoading}
            />{' '}
            <Text strong>Single key for all email addresses</Text>
            <br />
            <Text type="secondary">
              {singleKey
                ? 'A single key is used to decrypt email across all addresses. You should back up the key to avoid data loss. Refer to developer docs for more information.'
                : 'Each email address has its own key used to decrypt its email. You should back up the keys to avoid data loss. Refer to developer docs for more information.'}
            </Text>
          </div>
          {sessionExpired && !authError && (
            <Alert
              type="warning"
              showIcon
              message="Your session has expired. Sign in again."
              style={{ marginBottom: 16 }}
            />
          )}
          {authError && (
            <ErrorFeedback
              error={authError}
              message="An error occurred during sign in."
            />
          )}
          <Button
            className="sign-in-button"
            disabled={authLoading}
            loading={authLoading}
            onClick={handleSignIn}
          >
            {signInMethod === 'FSSO'
              ? 'Sign in with Federated SignIn'
              : 'Sign in with Registration Key'}
          </Button>
          {!authLoading && usedFsso && (
            <div style={{ marginTop: 16 }}>
              <Button kind="ghost" danger onClick={handleFederatedSignOut}>
                Sign Out
              </Button>
            </div>
          )}
          {!authLoading && !usedFsso && isRegistered && (
            <div style={{ marginTop: 16 }}>
              <Button kind="ghost" danger onClick={handleDeregister}>
                Deregister
              </Button>
            </div>
          )}
          {deregisterError && (
            <Alert
              type="error"
              message={deregisterError}
              style={{ marginTop: 16 }}
              closable
              onClose={() => setDeregisterError(undefined)}
            />
          )}
        </StyledCard>
      </ContentContainer>
    </PageContainer>
  )
}
