import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { AuthContext } from './AuthContext'

interface Props {
  children?: React.ReactNode
}

/**
 * Component used to check the authentication/sign in status.
 */
export const CheckAuth = ({ children }: Props): React.ReactElement => {
  const { userClient } = useContext(AuthContext)
  const isSignedIn = useAsync(async () => userClient.isSignedIn())

  return (
    <>
      {isSignedIn.error ? (
        <pre>{isSignedIn.error?.message}</pre>
      ) : isSignedIn.loading ? (
        <div />
      ) : isSignedIn.value === false ? (
        <Navigate to="/sign-in" />
      ) : (
        children
      )}
    </>
  )
}
