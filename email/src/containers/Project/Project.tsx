import React, { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { UserOutlined } from '@ant-design/icons'
import { ProjectContext, SudosContext } from '@contexts/index'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { Sidebar } from '@components/Sidebar'
import { Header } from '@components/Header'
import { message } from 'antd'
import {
  PageContainer,
  SidebarContainer,
  LayoutContainer,
  HeaderContainer,
  ContentContainer,
  StyledSudoPlatformLogo,
} from './Project.styled'
import { LoadingPage } from '@pages/LoadingPage'
import { SudosDropdown } from '@components/SudosDropdown'
import { useSudos } from '@hooks/useSudos'
import { useSudoClients } from '@hooks/useSudoClients'
import { EmailContainer } from '@containers/Email'
import { SudosContainer } from '@containers/Sudos'
import { AccountContainer } from '@containers/Account'
import { getUsedFederatedSignIn } from '@services/session'
import { signOut } from '@services/signOut'

interface Props {
  sudoUserClient: SudoUserClient
}

/**
 * The <Project> container provides context needed by project-level pages that
 * deal with a particular runtime instance, e.g. Email Service, Sudos, etc.
 *
 * Any data that need be shared across different pages should be handled here.
 */
export const Project = ({ sudoUserClient }: Props): React.ReactElement => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const {
    clientsLoading,
    clientsError,
    sudoEmailClient,
    sudoEntitlementsClient,
    sudoProfilesClient,
    enforceSingletonPublicKey,
    removeUserData,
  } = useSudoClients(sudoUserClient)
  const [signingOut, setSigningOut] = useState(false)

  const {
    sudosLoading,
    sudosError,
    sudos,
    listSudosHandler,
    activeSudo,
    setActiveSudo,
  } = useSudos(sudoProfilesClient)

  /**
   * Signs out the way the user signed in, and returns to the sign in page. A plain sign out keeps the user's
   * keys and registration, so they can read their email when they sign back in. Removing data and
   * deregistering are on the User Details page.
   */
  const signOutHandler = async (): Promise<void> => {
    if (signingOut) return
    setSigningOut(true)
    try {
      const federated = getUsedFederatedSignIn()
      // A federated sign out sends the browser to the sign in provider to clear its cookies, then back to the
      // app. The navigation below is for when it doesn't, for example without a federatedSignIn config.
      await signOut(sudoUserClient)
      if (!federated) void message.success('Successfully signed out')
      void navigate('/sign-in', { replace: true })
    } catch (error) {
      console.error(error)
      void message.error('Failed to sign out')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <ErrorBoundary error={clientsError}>
      {clientsLoading ? (
        <LoadingPage />
      ) : (
        sudoEmailClient &&
        sudoEntitlementsClient &&
        sudoProfilesClient && (
          <ProjectContext.Provider
            value={{
              sudoEmailClient,
              sudoEntitlementsClient,
              sudoProfilesClient,
              sudoUserClient,
              enforceSingletonPublicKey,
              removeUserData,
            }}
          >
            <PageContainer>
              <SidebarContainer width="252px">
                <StyledSudoPlatformLogo name="logo_light" />
                <Sidebar
                  urlPath={pathname}
                  menuItems={[
                    {
                      label: 'Sudos',
                      path: '/sudos',
                      icon: 'sudos',
                      children: [
                        {
                          label: 'Manage',
                          path: '/manage',
                        },
                      ],
                    },
                    {
                      label: 'Email',
                      path: '/email',
                      icon: 'email',
                      children: [
                        {
                          label: 'Manage',
                          path: '/manage',
                        },
                        {
                          label: 'Mailbox',
                          path: '/mailbox',
                        },
                        {
                          label: 'Aliases',
                          path: '/aliases',
                        },
                      ],
                    },
                    {
                      label: 'Account',
                      path: '/account',
                      icon: <UserOutlined />,
                      children: [
                        {
                          label: 'User Details',
                          path: '/user',
                        },
                        {
                          label: 'Import/Export Keys',
                          path: '/keys',
                        },
                      ],
                    },
                  ]}
                />
              </SidebarContainer>
              <ErrorBoundary error={sudosError}>
                <SudosContext.Provider
                  value={{
                    sudosLoading,
                    sudosError: sudosError?.error,
                    sudos,
                    listSudosHandler,
                    activeSudo,
                    setActiveSudo,
                  }}
                >
                  <LayoutContainer>
                    <HeaderContainer>
                      <Header onSignOut={signOutHandler}>
                        <SudosDropdown />
                      </Header>
                    </HeaderContainer>
                    <ContentContainer>
                      <Routes>
                        <Route path="email/*" element={<EmailContainer />} />
                        <Route path="sudos/*" element={<SudosContainer />} />
                        <Route
                          path="account/*"
                          element={<AccountContainer />}
                        />
                        <Route path="/" element={<Navigate to="sudos" />} />
                      </Routes>
                    </ContentContainer>
                  </LayoutContainer>
                </SudosContext.Provider>
              </ErrorBoundary>
            </PageContainer>
          </ProjectContext.Provider>
        )
      )}
    </ErrorBoundary>
  )
}
