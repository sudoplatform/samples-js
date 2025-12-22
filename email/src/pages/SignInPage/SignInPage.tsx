import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
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

export const SignInPage = (): React.ReactElement => {
  const { sudoUserClient, setAuthenticationTokens } = useContext(AuthContext)
  const navigate = useNavigate()

  const registerKeyUrl = require('@config/register_key.private') as RequestInfo
  const registerKeyIdUrl = require('@config/register_key.id') as RequestInfo

  const [authResult, authHandler] = useAsyncFn(async () => {
    const authTokens = await authenticateWithRegisterKey(
      registerKeyUrl,
      registerKeyIdUrl,
      sudoUserClient,
    )

    setAuthenticationTokens(authTokens)
    navigate('/')
  })

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
          {authResult.error ? (
            <ErrorFeedback
              error={authResult.error}
              message="An error occurred during registration."
            />
          ) : (
            <Button
              className="sign-in-button"
              disabled={authResult.loading}
              loading={authResult.loading}
              onClick={authHandler}
            >
              Sign in with Registration Key
            </Button>
          )}
        </StyledCard>
      </ContentContainer>
    </PageContainer>
  )
}
