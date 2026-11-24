import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Descriptions,
  Modal,
  Space,
  Spin,
  Typography,
  message,
} from 'antd'
import { ProjectContext } from '@contexts/index'
import { Card } from '@components/Card'
import { Page, PageHeading, ContentRow } from '@components/Layout'
import {
  clearLastSignedInUser,
  getUsedFederatedSignIn,
} from '@services/session'
import { deregister, signOut } from '@services/signOut'
import { describeError, formatDateTime } from '@util/format'

const { Text } = Typography

interface UserDetails {
  userName?: string
  subject?: string
  signedIn: boolean
  idTokenExpiry?: Date
  refreshTokenExpiry?: Date
}

const NOT_AVAILABLE = 'Not available'

const Copyable = ({ value }: { value?: string }): React.ReactElement =>
  value ? (
    <Text code copyable>
      {value}
    </Text>
  ) : (
    <Text type="secondary">{NOT_AVAILABLE}</Text>
  )

/**
 * The `User Details` page shows the signed in user and their session, and offers the ways to leave the
 * account that remove data: Sign Out and Remove Data for federated users, Deregister for TEST registrations.
 */
export const UserDetailsPage = (): React.ReactElement => {
  const navigate = useNavigate()
  const { sudoUserClient, enforceSingletonPublicKey, removeUserData } =
    useContext(ProjectContext)
  const [details, setDetails] = useState<UserDetails>()
  const [error, setError] = useState<string>()
  const usedFsso = getUsedFederatedSignIn()

  useEffect(() => {
    const load = async () => {
      try {
        setDetails({
          userName: await sudoUserClient.getUserName(),
          subject: await sudoUserClient.getSubject(),
          signedIn: await sudoUserClient.isSignedIn(),
          idTokenExpiry: await sudoUserClient.getTokenExpiry(),
          refreshTokenExpiry: await sudoUserClient.getRefreshTokenExpiry(),
        })
      } catch (err) {
        console.error(err)
        setError(describeError(err))
      }
    }
    void load()
  }, [sudoUserClient])

  const handleSignOutAndRemoveData = () => {
    const confirmation = Modal.confirm({
      title: 'Sign Out and Remove Data?',
      content:
        "This deletes your keys from this browser. Without a key backup, you won't be able to read your Sudos or email when you sign in again, here or in another browser.",
      okText: 'Sign Out and Remove Data',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <Button
            onClick={() => {
              confirmation.destroy()
              void navigate('/account/keys')
            }}
          >
            Export Keys First
          </Button>
          <CancelBtn />
          <OkBtn />
        </>
      ),
      onOk: async () => {
        try {
          await removeUserData()
          clearLastSignedInUser()
          // A federated sign out sends the browser to the sign in provider, so the navigation is a fallback.
          await signOut(sudoUserClient)
          void navigate('/sign-in', { replace: true })
        } catch (err) {
          console.error(err)
          void message.error(`Unable to sign out: ${describeError(err)}`)
        }
      },
    })
  }

  const handleDeregister = () => {
    Modal.confirm({
      title: 'Deregister?',
      content:
        'Are you sure you want to deregister? All Sudos and associated data will be deleted.',
      okText: 'Deregister',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deregister(sudoUserClient, removeUserData)
          void message.success('Deregistered')
          void navigate('/sign-in', { replace: true })
        } catch (err) {
          console.error(err)
          void message.error(`Unable to deregister: ${describeError(err)}`)
        }
      },
    })
  }

  return (
    <Page>
      <PageHeading>User Details</PageHeading>
      {error && (
        <ContentRow>
          <Alert
            type="error"
            showIcon
            message="Failed to load user details"
            description={error}
          />
        </ContentRow>
      )}
      {!details && !error && <Spin />}
      {details && (
        <>
          <ContentRow>
            <Card title="Account">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="User ID">
                  <Copyable value={details.userName} />
                </Descriptions.Item>
                <Descriptions.Item label="Subject">
                  <Copyable value={details.subject} />
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </ContentRow>
          <ContentRow>
            <Card title="Session">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Signed in">
                  {details.signedIn ? 'Yes' : 'No'}
                </Descriptions.Item>
                <Descriptions.Item label="Signed in with">
                  {usedFsso ? 'Federated SignIn' : 'TEST Registration'}
                </Descriptions.Item>
                <Descriptions.Item label="Key config">
                  {enforceSingletonPublicKey
                    ? 'Single key for email addresses'
                    : 'Key per email address'}
                </Descriptions.Item>
                <Descriptions.Item label="ID token expires">
                  {formatDateTime(details.idTokenExpiry)}
                </Descriptions.Item>
                <Descriptions.Item label="Refresh token expires">
                  {formatDateTime(details.refreshTokenExpiry)}
                </Descriptions.Item>
              </Descriptions>
              <Text type="secondary">
                The ID token is refreshed automatically until the refresh token
                expires, after which you need to sign in again.
              </Text>
            </Card>
          </ContentRow>
        </>
      )}
      <ContentRow>
        <Card title="Leave Account">
          <Space direction="vertical">
            {usedFsso ? (
              <>
                <Text type="secondary">
                  Sign Out keeps your keys in this browser until the page is
                  reloaded, so you can read your Sudos and email when you sign
                  back in. Sign Out and Remove Data deletes them.
                </Text>
                <Button danger onClick={handleSignOutAndRemoveData}>
                  Sign Out and Remove Data
                </Button>
              </>
            ) : (
              <>
                <Text type="secondary">
                  Sign Out keeps this TEST registration, so you can sign back in
                  as the same user. Deregister deletes the user and all of their
                  data.
                </Text>
                <Button danger onClick={handleDeregister}>
                  Deregister
                </Button>
              </>
            )}
          </Space>
        </Card>
      </ContentRow>
    </Page>
  )
}
