import React from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { ProjectContext, SudosContext } from '@contexts'
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
  } = useSudoClients(sudoUserClient)

  const {
    sudosLoading,
    sudosError,
    sudos,
    listSudosHandler,
    activeSudo,
    setActiveSudo,
  } = useSudos(sudoProfilesClient)

  /**
   * Handler function to de-register active sudo clients
   * and then redirect back to login page.
   */
  const signOutHandler = async (): Promise<void> => {
    try {
      if (sudoProfilesClient) {
        await sudoProfilesClient.reset()
        await sudoUserClient.reset()

        void message.success('Successfully signed out')
        navigate('/sign-in')
      }
    } catch (error) {
      void message.error('Failed to deregister')
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
                      ],
                    },
                  ]}
                />
              </SidebarContainer>
              <ErrorBoundary error={sudosError}>
                <SudosContext.Provider
                  value={{
                    sudosLoading,
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
