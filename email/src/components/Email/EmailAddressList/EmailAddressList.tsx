import React, { useContext, useState } from 'react'
import { EmailAddress } from '@sudoplatform/sudo-email'
import { EmailContext } from '@contexts'
import { TableCard as Card } from '@components/Card'
import { Table, DangerLink } from '@components/Table'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { useEmailAddressDeprovision } from '@hooks/useEmailAddressDeprovision'
import { useUpdateEmailAddress } from '@hooks/useUpdateEmailAddress'
import {
  StyledLinkButton,
  AliasInput,
  ButtonsWrapper,
} from './EmailAddressList.styled'
import { Tag, message } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

/**
 * Component that renders the list of email addresses from `<EmailContext>`.
 */
export const EmailAddressList = (): React.ReactElement => {
  const {
    activeEmailAddress,
    setActiveEmailAddress,
    emailAddresses,
    emailAddressesLoading,
    emailAddressesError,
    listEmailAddressesHandler,
  } = useContext(EmailContext)

  const {
    deprovisionEmailAddressLoading,
    deprovisionEmailAddressError,
    deprovisionEmailAddressHandler,
  } = useEmailAddressDeprovision()

  const {
    updateEmailAddressError,
    updateEmailAddressLoading,
    updateEmailAddressHandler,
  } = useUpdateEmailAddress()

  const [updateId, setUpdateId] = useState<string | undefined>()
  const [updateAliasValue, setUpdateAliasValue] = useState<string | undefined>()

  /**
   * Handler function to invoke the email deprovision API for a given
   * email address.
   */
  const deprovisionEmailAddress = async (
    emailAddress: EmailAddress,
  ): Promise<void> => {
    try {
      await deprovisionEmailAddressHandler(emailAddress)

      void message.success(
        `Email address '${emailAddress.emailAddress}' deprovisioned`,
      )
      void listEmailAddressesHandler()
    } catch (error) {
      void message.error('Failed to deprovision email address')
    }
  }

  const updateEmailAddress = async (
    emailAddress: EmailAddress,
  ): Promise<void> => {
    if (updateAliasValue) {
      await updateEmailAddressHandler(emailAddress, updateAliasValue)
      setUpdateId(undefined)
      listEmailAddressesHandler()
    }
  }

  return (
    <Card title="Email Addresses">
      <ErrorBoundary
        error={
          emailAddressesError ??
          deprovisionEmailAddressError ??
          updateEmailAddressError
        }
      >
        <Table
          dataSource={emailAddresses}
          rowKey="id"
          loading={emailAddressesLoading || deprovisionEmailAddressLoading}
          columns={[
            {
              title: 'Alias',
              dataIndex: 'alias',
              render: (colData, rowData) => {
                const { alias, id } = rowData as EmailAddress
                return updateId === id ? (
                  <AliasInput
                    defaultValue={alias ?? ''}
                    onChange={(e) => setUpdateAliasValue(e.target.value)}
                    placeholder="Enter new alias..."
                  />
                ) : (
                  <>{colData ?? '-'}</>
                )
              },
            },
            {
              title: 'Email Address',
              dataIndex: 'emailAddress',
            },
            {
              title: 'ID',
              dataIndex: 'id',
            },
            {
              render: (_, rowData) => {
                const emailAddress = rowData as EmailAddress
                const { emailAddress: emailAddressValue, id } = emailAddress

                return (
                  <ButtonsWrapper>
                    {updateId === emailAddress.id ? (
                      <>
                        {updateEmailAddressLoading ? (
                          <LoadingOutlined />
                        ) : (
                          <StyledLinkButton
                            disabled={updateEmailAddressLoading || !updateId}
                            id={`email-address-${emailAddressValue}-update-save-button`}
                            onClick={() => updateEmailAddress(emailAddress)}
                          >
                            Save
                          </StyledLinkButton>
                        )}
                        <DangerLink
                          disabled={updateEmailAddressLoading}
                          id={`email-address-${emailAddressValue}-update-cancel-button`}
                          onClick={() => setUpdateId(undefined)}
                        >
                          Cancel
                        </DangerLink>
                      </>
                    ) : (
                      <>
                        {id === activeEmailAddress?.id ? (
                          <Tag color="blue" style={{ margin: 0 }}>
                            Active
                          </Tag>
                        ) : (
                          <StyledLinkButton
                            id={`email-address-${emailAddressValue}-set-button`}
                            onClick={() => setActiveEmailAddress(emailAddress)}
                          >
                            Use
                          </StyledLinkButton>
                        )}
                        <StyledLinkButton
                          id={`email-address-${emailAddressValue}-edit-button`}
                          onClick={() => setUpdateId(id)}
                        >
                          Edit
                        </StyledLinkButton>
                        <DangerLink
                          id={`email-address-${emailAddressValue}-delete-button`}
                          onClick={() => deprovisionEmailAddress(emailAddress)}
                        >
                          Remove
                        </DangerLink>
                      </>
                    )}
                  </ButtonsWrapper>
                )
              },
            },
          ]}
        />
      </ErrorBoundary>
    </Card>
  )
}
