import React, { useContext } from 'react'
import { Redirect } from 'react-router-dom'
import { useAsync } from 'react-use'
import { AuthContext } from './AuthContext'

export const CheckAuth: React.FC = (props) => {
  const { userClient } = useContext(AuthContext)
  const isSignedIn = useAsync(async () => userClient.isSignedIn())

  return (
    <>
      {isSignedIn.error ? (
        <pre>{isSignedIn.error.message}</pre>
      ) : isSignedIn.loading ? (
        <div />
      ) : isSignedIn.value === false ? (
        <Redirect to="/sign-in" />
      ) : (
        props.children
      )}
    </>
  )
}
