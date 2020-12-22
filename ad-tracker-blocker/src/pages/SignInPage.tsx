import { TESTAuthenticationProvider } from '@sudoplatform/sudo-user/lib/user/auth-provider'
import React, { useCallback, useContext } from 'react'
import { AuthContext } from '../components/AuthContext'

import { useAsyncFn } from 'react-use'
import { Button, Card, HSpace } from '@sudoplatform/web-ui'
import { Redirect } from 'react-router-dom'
import { ErrorFeedback } from '../components/ErrorFeedback'

export const SignInPage: React.FC = () => {
  const { userClient } = useContext(AuthContext)

  /**
   * Async callback. Performs registration using "Sign In Key" registration.
   */
  const [keyRegistrationResult, registerWithKey] = useAsyncFn(async () => {
    // Get TEST registration key+id
    const [registerKey, registerKeyId] = await Promise.all([
      fetch('/register_key.private').then((response) => response.text()),
      fetch('/register_key.id').then((response) => response.text()),
    ])

    // Register a new user
    await userClient.registerWithAuthenticationProvider(
      new TESTAuthenticationProvider('system-test', registerKey, registerKeyId),
    )

    // Sign in
    await userClient.signInWithKey()

    return 'complete'
  })

  /**
   * Callback. Initiates sign-in using Federated Single Sign-On
   */
  const handleFSSOSignIn = useCallback(() => {
    userClient.presentFederatedSignInUI()
  }, [userClient])

  return (
    <Card title="Sign In">
      <p>
        For more information about how to configure the different sign-in
        methods in this application, see the README.md file.
      </p>
      <p>Please select a sign in method:</p>

      {keyRegistrationResult.error ? (
        <ErrorFeedback
          error={keyRegistrationResult.error}
          message="An error occurred during registration."
        />
      ) : keyRegistrationResult.value === 'complete' ? (
        <Redirect to="/" />
      ) : (
        <HSpace>
          <Button
            disabled={keyRegistrationResult.loading}
            onClick={handleFSSOSignIn}
          >
            Sign In with FSSO
          </Button>

          <Button
            disabled={keyRegistrationResult.loading}
            loading={keyRegistrationResult.loading}
            onClick={registerWithKey}
          >
            Sign In with Key
          </Button>
        </HSpace>
      )}
    </Card>
  )
}
