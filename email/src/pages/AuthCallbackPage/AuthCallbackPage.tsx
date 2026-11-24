import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoadingOutlined } from '@ant-design/icons'
import { AuthContext } from '@contexts/index'
import { ErrorFeedback } from '@components/ErrorFeedback'
import { SimplePage } from '@components/SimplePage'
import { setUsedFederatedSignIn } from '@services/session'

/**
 * Federated sign in and sign out both redirect here, as set by `signInRedirectUri` and `signOutRedirectUri`
 * in sudoplatformconfig.json. A sign in returns with the result, or an error, in the query. A sign out
 * returns with nothing to process, so this goes back to the sign in page.
 */
export const AuthCallbackPage = (): React.ReactElement => {
  const { sudoUserClient, setAuthenticationTokens } = useContext(AuthContext)
  const navigate = useNavigate()
  const [error, setError] = useState<Error>()
  // The redirect's code can be redeemed only once, so React's development double effect must not repeat it.
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true
    const params = new URLSearchParams(window.location.search)
    if (!params.has('code') && !params.has('error')) {
      void navigate('/sign-in', { replace: true })
      return
    }
    const complete = async () => {
      try {
        const providerError = params.get('error')
        if (providerError) {
          throw new Error(params.get('error_description') ?? providerError)
        }
        const authTokens = await sudoUserClient.processFederatedSignInTokens(
          window.location.href,
        )
        setUsedFederatedSignIn(true)
        setAuthenticationTokens(authTokens)
        // Drops the sign in result from the address and history.
        void navigate('/', { replace: true })
      } catch (err) {
        console.error('Federated sign-in error:', err)
        window.history.replaceState({}, '', '/callback')
        setError(err as Error)
      }
    }
    void complete()
  }, [sudoUserClient, navigate, setAuthenticationTokens])

  return (
    <SimplePage>
      {error ? (
        <>
          <ErrorFeedback
            error={error}
            message="An error occurred during federated sign in."
          />
          <Link to="/sign-in" replace>
            Back to sign in
          </Link>
        </>
      ) : (
        <>
          <LoadingOutlined /> Signing in...
        </>
      )}
    </SimplePage>
  )
}
