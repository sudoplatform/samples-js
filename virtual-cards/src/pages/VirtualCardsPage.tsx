import { DefaultSudoProfilesClient } from '@sudoplatform/sudo-profiles'
import { DefaultSudoSecureIdVerificationClient } from '@sudoplatform/sudo-secure-id-verification'
import {
  GraphQLClientAuthMode,
  internal,
  SudoUserClient,
} from '@sudoplatform/sudo-user'
import { HSpace, Spinner } from '@sudoplatform/web-ui'
import React, { useEffect, useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { ErrorFeedback } from '../components/ErrorFeedback'
import {
  AlignLeftOutlined,
  CreditCardOutlined,
  DollarOutlined,
  IdcardOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { DefaultSudoEntitlementsClient } from '@sudoplatform/sudo-entitlements'
import { Button, Layout, Menu, message } from 'antd'
import styled from 'styled-components'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { IdentityVerification } from '../components/IdentityVerification'
import { SudoManagement } from '../components/sudo/SudoManagement'
import { FundingSourceManagement } from '../components/fundingSource/FundingSourceManagement'
import { DefaultSudoVirtualCardsClient } from '@sudoplatform/sudo-virtual-cards'
import { AppContext } from '../containers/AppContext'
import { OrphanedVirtualCardManagement } from '../components/sudo/virtualCard/OrphanedVirtualCardManagement'
import { TransactionManagement } from '../components/transaction/TransactionManagement'
import { DefaultSudoVirtualCardsSimulatorClient } from '@sudoplatform/sudo-virtual-cards-simulator'
import { DefaultConfigurationManager } from '@sudoplatform/sudo-common'
import * as t from 'io-ts'

const { Header, Content, Sider } = Layout

const SudoLogo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  text-align: center;
  font-size: 0.8vw;
`

const CenteredContent = styled.div`
  max-width: 960px;
  margin: auto;
  width: 100%;
`

const SimulatorApiConfig = t.type({
  apiUrl: t.string,
  apiKey: t.string,
  region: t.string,
})
type SimulatorApiConfig = t.TypeOf<typeof SimulatorApiConfig>

interface Props {
  userClient: SudoUserClient
}

export const VirtualCardsPage: React.FC<Props> = ({ userClient }) => {
  const [isVerified, setIsVerified] = useState(false)

  const [deregisterResult, deregister] = useAsyncFn(async () => {
    await initState?.value?.profilesClient.reset()
    await initState?.value?.identityVerificationClient.reset()
    await userClient.reset()
    return 'complete'
  })

  // Handle deregister error as side effect
  useEffect(() => {
    if (deregisterResult.error) {
      void message.error('Failed to deregister')
    }
  }, [deregisterResult.error])

  const initState = useAsync(async () => {
    const identityVerificationClient =
      new DefaultSudoSecureIdVerificationClient({ sudoUserClient: userClient })
    const entitlementsClient = new DefaultSudoEntitlementsClient(userClient)
    await entitlementsClient.redeemEntitlements()
    const profilesClient = new DefaultSudoProfilesClient({
      sudoUserClient: userClient,
    })
    await profilesClient.pushSymmetricKey(
      '1234',
      '14A9B3C3540142A11E70ACBB1BD8969F',
    )
    const virtualCardsClient = new DefaultSudoVirtualCardsClient({
      sudoUserClient: userClient,
    })
    const config =
      DefaultConfigurationManager.getInstance().bindConfigSet<SimulatorApiConfig>(
        SimulatorApiConfig,
        'vcSimulator',
      )
    const graphQLClient = new internal.AmplifyClient({
      graphqlUrl: config.apiUrl,
      region: config.region,
      authMode: GraphQLClientAuthMode.ApiKey,
      apiKey: config.apiKey,
    })

    const virtualCardsSimulatorClient =
      new DefaultSudoVirtualCardsSimulatorClient({ graphQLClient })
    return {
      identityVerificationClient,
      entitlementsClient,
      profilesClient,
      virtualCardsClient,
      virtualCardsSimulatorClient,
    }
  })

  const menuItems = [
    {
      key: '1',
      icon: <IdcardOutlined />,
      label: <Link to="identity-verification">Identity Verification</Link>,
    },
    {
      key: '2',
      icon: <TeamOutlined />,
      label: <Link to="sudos">Sudos</Link>,
    },
    {
      key: '3',
      icon: <DollarOutlined />,
      label: <Link to="funding-sources">Funding Sources</Link>,
    },
    {
      key: '4',
      icon: <CreditCardOutlined />,
      label: <Link to="orphaned-virtual-cards">Orphaned Virtual Cards</Link>,
    },
    {
      key: '5',
      icon: <AlignLeftOutlined />,
      label: <Link to="transactions">Transactions</Link>,
    },
  ]

  if (initState.error) {
    return (
      <ErrorFeedback
        error={initState.error}
        message="An error occurred initializing clients."
      />
    )
  } else if (initState.value) {
    const {
      profilesClient,
      identityVerificationClient,
      entitlementsClient,
      virtualCardsClient,
      virtualCardsSimulatorClient,
    } = initState.value
    return (
      <AppContext.Provider
        value={{
          identityVerificationClient: identityVerificationClient,
          entitlementsClient: entitlementsClient,
          profilesClient: profilesClient,
          virtualCardsClient: virtualCardsClient,
          virtualCardsSimulatorClient: virtualCardsSimulatorClient,
        }}
      >
        <Layout style={{ minHeight: '100vh' }}>
          <Sider>
            <SudoLogo>Virtual Cards Sample</SudoLogo>
            <Menu
              theme="dark"
              defaultSelectedKeys={['1']}
              mode="inline"
              items={menuItems}
            ></Menu>
          </Sider>
          <Layout>
            <Header style={{ padding: 0 }}>
              <HSpace horizontalAlign="right">
                <Button
                  type="dashed"
                  onClick={deregister}
                  style={{ background: 'none', color: 'white' }}
                >
                  Sign Out
                </Button>
                {deregisterResult.value === 'complete' && <Navigate to="/" />}
              </HSpace>
            </Header>
            <Content style={{ margin: '0 16px' }}>
              <CenteredContent>
                <div
                  className="site-layout-background"
                  style={{ padding: 24, minHeight: 360 }}
                >
                  <Routes>
                    <Route
                      path="/identity-verification"
                      element={
                        <IdentityVerification
                          isVerified={isVerified}
                          onIsVerifiedChanged={(isVerified) =>
                            setIsVerified(isVerified)
                          }
                        />
                      }
                    ></Route>
                    <Route path="/sudos" element={<SudoManagement />}></Route>
                    <Route
                      path="/funding-sources"
                      element={
                        <FundingSourceManagement
                          isVerified={isVerified}
                          deregisterResult={deregisterResult}
                          onIsVerifiedChanged={(isVerified) =>
                            setIsVerified(isVerified)
                          }
                        />
                      }
                    ></Route>
                    <Route
                      path="/orphaned-virtual-cards"
                      element={<OrphanedVirtualCardManagement />}
                    ></Route>
                    <Route
                      path="/transactions"
                      element={<TransactionManagement />}
                    ></Route>
                    <Route
                      index
                      element={<Navigate to="identity-verification" />}
                    />
                  </Routes>
                </div>
              </CenteredContent>
            </Content>
          </Layout>
        </Layout>
      </AppContext.Provider>
    )
  } else {
    return (
      <>
        <Spinner />
        Loading...
      </>
    )
  }
}
