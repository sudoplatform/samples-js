import React, { useContext } from 'react'
import { TESTAuthenticationProvider } from '@sudoplatform/sudo-user'
import { Button, Card, HSpace } from '@sudoplatform/web-ui'
import { useAsyncFn } from 'react-use'
import { AuthContext } from '../components/AuthContext'
import { ErrorFeedback } from '../components/ErrorFeedback'
import { Navigate } from 'react-router-dom'
import styled from 'styled-components'

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const CenteredContent = styled.div`
  max-width: 600px;
  padding: 30px;
  width: 100%;
`

export const SignInPage: React.FC = () => {
  const { userClient, setAuthenticationTokens } = useContext(AuthContext)

  const [keyRegistrationResult, registerWithKey] = useAsyncFn(async () => {
    const registerKeyUrl =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../config/register_key.private') as RequestInfo
    const registerKeyIdUrl =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../config/register_key.id') as RequestInfo
    const [registerKey, registerKeyId] = await Promise.all([
      fetch(registerKeyUrl).then((response) => {
        if (!response.ok) {
          throw new Error(
            `Unable to read register_key.private: ${response.status}`,
          )
        }
        return response.text()
      }),
      fetch(registerKeyIdUrl).then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to read register_key.id: ${response.status}`)
        }
        return response.text()
      }),
    ])

    await userClient.registerWithAuthenticationProvider(
      new TESTAuthenticationProvider('system-test', registerKey, registerKeyId),
    )
    const authTokens = await userClient.signInWithKey()
    setAuthenticationTokens(authTokens)
    return 'complete'
  })

  return (
    <Container>
      <CenteredContent>
        <h1>Virtual Cards Sample</h1>
        <Card title="Sign in">
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

          {keyRegistrationResult.error ? (
            <ErrorFeedback
              error={keyRegistrationResult.error}
              message="An error occurred during registration."
            />
          ) : keyRegistrationResult.value === 'complete' ? (
            <Navigate to="/" />
          ) : (
            <HSpace>
              <Button
                disabled={keyRegistrationResult.loading}
                loading={keyRegistrationResult.loading}
                onClick={registerWithKey}
              >
                Sign in with Registration Key
              </Button>
            </HSpace>
          )}
        </Card>
      </CenteredContent>
    </Container>
  )
}
