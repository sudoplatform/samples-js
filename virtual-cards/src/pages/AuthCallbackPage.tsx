import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { AuthContext } from '../components/AuthContext'

export const AuthCallbackPage: React.FC = () => {
  const { userClient } = useContext(AuthContext)

  const status = useAsync(
    async () => userClient.processFederatedSignInTokens(location.href),
    [userClient],
  )

  return (
    <>
      {status.error ? (
        <pre>{status.error.message}</pre>
      ) : status.loading ? (
        'Signing in...'
      ) : (
        <Navigate to={'/'} />
      )}
    </>
  )
}
