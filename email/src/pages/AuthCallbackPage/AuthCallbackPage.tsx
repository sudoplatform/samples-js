import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { AuthContext } from '@contexts/index'

export const AuthCallbackPage = (): React.ReactElement => {
  const { sudoUserClient } = useContext(AuthContext)
  const navigate = useNavigate()

  const status = useAsync(async () => {
    await sudoUserClient.processFederatedSignInTokens(location.href)
    navigate('/')
  }, [sudoUserClient])

  return (
    <>{status.error ? <pre>{status.error.message}</pre> : 'Signing in...'}</>
  )
}
