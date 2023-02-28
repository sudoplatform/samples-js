import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { AuthContext } from '@contexts'

interface Props {
  children?: React.ReactNode
}

export const CheckAuth = ({ children }: Props): React.ReactElement => {
  const { sudoUserClient } = useContext(AuthContext)
  const navigate = useNavigate()

  const { loading, error } = useAsync(async () => {
    const result = await sudoUserClient.isSignedIn()

    // If user not logged in, redirect back to sign in page.
    // Otherwise, child components are rendered.
    if (!result) {
      navigate('/sign-in')
    }
  })

  return loading ? <></> : error ? <pre>{error.message}</pre> : <>{children}</>
}
