import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '@contexts/index'
import { LoadingPage } from '@pages/LoadingPage'
import { onNotAuthorized } from '@services/sessionExpiry'

const SESSION_CHECK_INTERVAL_MS = 60_000

interface Props {
  children?: React.ReactNode
}

export const CheckAuth = ({ children }: Props): React.ReactElement => {
  const { sudoUserClient } = useContext(AuthContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSignIn = async () => {
      let signedIn = false
      try {
        signedIn = await sudoUserClient.isSignedIn()
      } catch (err) {
        // Treated as signed out, so the sign in page shows rather than a spinner that never ends.
        console.error('Failed to check sign in', err)
      }
      if (!signedIn) {
        // The spinner stays until the sign in page replaces this, so the signed in pages never start
        // without a user.
        void navigate('/sign-in', { replace: true })
        return
      }
      setLoading(false)
    }
    void checkSignIn()
  }, [sudoUserClient, navigate])

  // Sends the user back to sign in when the session ends: when the refresh token is about to expire, or when
  // the service rejects the tokens and refreshing them once doesn't help.
  useEffect(() => {
    if (loading) return
    let expired = false
    const expire = async () => {
      if (expired) return
      expired = true
      // Clears the rejected tokens, otherwise the sign in page finds the user signed in and comes back here.
      try {
        await sudoUserClient.clearAuthenticationTokens()
      } catch (err) {
        console.error('Failed to clear the expired session', err)
      }
      void navigate('/sign-in', {
        replace: true,
        state: { sessionExpired: true },
      })
    }
    const checkSession = async () => {
      try {
        if (!(await sudoUserClient.isSignedIn())) await expire()
      } catch (err) {
        console.error('Failed to check sign in', err)
      }
    }
    let refreshing = false
    const refreshSession = async () => {
      if (refreshing || expired) return
      refreshing = true
      try {
        const refreshToken = await sudoUserClient.getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token')
        await sudoUserClient.refreshTokens(refreshToken)
      } catch (err) {
        console.error('Failed to refresh the session', err)
        await expire()
      } finally {
        refreshing = false
      }
    }
    const interval = setInterval(
      () => void checkSession(),
      SESSION_CHECK_INTERVAL_MS,
    )
    const onFocus = () => void checkSession()
    window.addEventListener('focus', onFocus)
    const stopListening = onNotAuthorized(() => void refreshSession())
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      stopListening()
    }
  }, [loading, sudoUserClient, navigate])

  return loading ? <LoadingPage /> : <>{children}</>
}
