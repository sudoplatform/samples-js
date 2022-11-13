import { DefaultSudoProfilesClient } from '@sudoplatform/sudo-profiles'
import { DefaultSudoSecureIdVerificationClient } from '@sudoplatform/sudo-secure-id-verification'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { HSpace, Spinner } from '@sudoplatform/web-ui'
import React, { useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { ErrorFeedback } from '../components/ErrorFeedback'
import {
  IdcardOutlined,
  TeamOutlined,
  DollarOutlined,
  CreditCardOutlined,
  AlignLeftOutlined,
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
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync'

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
    userClient.reset()
    return 'complete'
  })

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
    const appSyncClient = new AWSAppSyncClient({
      disableOffline: true,
      url: config.apiUrl,
      region: config.region,
      auth: {
        type: AUTH_TYPE.API_KEY,
        apiKey: config.apiKey,
      },
    })

    const virtualCardsSimulatorClient =
      new DefaultSudoVirtualCardsSimulatorClient({ appSyncClient })
    return {
      identityVerificationClient,
      entitlementsClient,
      profilesClient,
      virtualCardsClient,
      virtualCardsSimulatorClient,
    }
  })

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
            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
              <Menu.Item key="1" icon={<IdcardOutlined />}>
                Identity Verification
                <Link to="identity-verification" />
              </Menu.Item>
              <Menu.Item key="2" icon={<TeamOutlined />}>
                Sudos
                <Link to="sudos" />
              </Menu.Item>
              <Menu.Item key="3" icon={<DollarOutlined />}>
                Funding Sources
                <Link to="funding-sources" />
              </Menu.Item>
              <Menu.Item key="4" icon={<CreditCardOutlined />}>
                Orphaned Virtual Cards
                <Link to="orphaned-virtual-cards" />
              </Menu.Item>
              <Menu.Item key="5" icon={<AlignLeftOutlined />}>
                Transactions
                <Link to="transactions" />
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Header style={{ padding: 0 }}>
              <HSpace horizontalAlign="right">
                <>
                  <Button
                    type="dashed"
                    onClick={deregister}
                    style={{ background: 'none', color: 'white' }}
                  >
                    Sign Out
                  </Button>
                  {deregisterResult.error
                    ? message.error('Failed to deregister')
                    : deregisterResult.value === 'complete' && (
                        <Navigate to="/" />
                      )}
                </>
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
