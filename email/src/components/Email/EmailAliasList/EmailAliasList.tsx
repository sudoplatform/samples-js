import React, { useContext, useState } from 'react'
import {
  EmailAlias,
  EmailAliasRealAddressType,
  EmailAliasStatus,
} from '@sudoplatform/sudo-email'
import { TableCard as Card } from '@components/Card'
import { Table, DangerLink } from '@components/Table'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { useUpdateEmailAlias } from '@hooks/useUpdateEmailAlias'
import { useEmailAliasDeprovision } from '@hooks/useEmailAliasDeprovision'
import { useEmailAliasDisable } from '@hooks/useEmailAliasDisable'
import { useEmailAliasEnable } from '@hooks/useEmailAliasEnable'
import { useVerifyExternalEmail } from '@hooks/useVerifyExternalEmail'
import { StyledLinkButton, ButtonsWrapper } from './EmailAliasList.styled'
import { message, Tag, Form, Input, DatePicker, Button, Modal } from 'antd'
import { EmailAliasContext } from '@contexts/EmailAliasContext'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

export interface EmailAliasInputs {
  expiresAt?: Dayjs
  metadata?: string
}

interface EmailAliasListProps {
  showExternal: boolean
}

/**
 * Component that renders the list of email alias from `<EmailAliasContext>`.
 */
export const EmailAliasList = ({
  showExternal,
}: EmailAliasListProps): React.ReactElement => {
  const {
    emailAliases,
    emailAliasesLoading,
    emailAliasesError,
    listEmailAliasesHandler,
  } = useContext(EmailAliasContext)

  const {
    deprovisionEmailAliasLoading,
    deprovisionEmailAliasError,
    deprovisionEmailAliasHandler,
  } = useEmailAliasDeprovision()

  const {
    enableEmailAliasLoading,
    enableEmailAliasError,
    enableEmailAliasHandler,
  } = useEmailAliasEnable()

  const {
    disableEmailAliasLoading,
    disableEmailAliasError,
    disableEmailAliasHandler,
  } = useEmailAliasDisable()

  const {
    updateEmailAliasError,
    updateEmailAliasLoading,
    updateEmailAliasHandler,
  } = useUpdateEmailAlias()

  const { verifyLoading, initiateVerification, completeVerification } =
    useVerifyExternalEmail()

  const [verifyingAliasId, setVerifyingAliasId] = useState<string | null>(null)
  const [verifyingAliasAddress, setVerifyingAliasAddress] = useState<string>('')
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationCodeError, setVerificationCodeError] = useState<
    string | null
  >(null)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [form] = Form.useForm<EmailAliasInputs>()

  const isEditing = (record: EmailAlias) => record.id === editingId

  /**
   * Handler function to invoke the email deprovision API for a given
   * email address.
   */
  const deprovisionEmailAlias = async (
    emailAlias: EmailAlias,
  ): Promise<void> => {
    try {
      await deprovisionEmailAliasHandler(emailAlias)

      void message.success(
        `Email alias '${emailAlias.aliasAddress}' deprovisioned for Email Address '${emailAlias.realAddress}'`,
      )
      void listEmailAliasesHandler()
    } catch (error) {
      void message.error('Failed to deprovision email alias')
    }
  }

  const disableEmailAlias = async (emailAlias: EmailAlias): Promise<void> => {
    try {
      await disableEmailAliasHandler(emailAlias)

      void message.success(
        `Email alias '${emailAlias.aliasAddress}' disabled for Email Address '${emailAlias.realAddress}'`,
      )
      void listEmailAliasesHandler()
    } catch (error) {
      void message.error('Failed to disable email alias')
    }
  }

  const enableEmailAlias = async (emailAlias: EmailAlias): Promise<void> => {
    try {
      await enableEmailAliasHandler(emailAlias)

      void message.success(
        `Email alias '${emailAlias.aliasAddress}' enabled for Email Address '${emailAlias.realAddress}'`,
      )
      void listEmailAliasesHandler()
    } catch (error) {
      void message.error('Failed to enable email alias')
    }
  }

  const updateEmailAlias = async (emailAlias: EmailAlias): Promise<void> => {
    let values: EmailAliasInputs
    try {
      values = await form.validateFields()
    } catch {
      // Form validation failed — Ant Design shows inline errors
      return
    }
    try {
      await updateEmailAliasHandler(
        emailAlias,
        values.metadata,
        values.expiresAt,
      )
      void listEmailAliasesHandler()
    } catch (error) {
      void message.error('Failed to update email alias')
    }
  }

  const handleVerifyClick = async (emailAlias: EmailAlias): Promise<void> => {
    setVerifyingAliasId(emailAlias.id)
    setVerifyingAliasAddress(emailAlias.realAddress)
    try {
      await initiateVerification(emailAlias.id, emailAlias.realAddress)
      setVerifyModalOpen(true)
      setVerificationCode('')
      setVerificationCodeError(null)
    } catch (error) {
      void message.error(
        (error as Error).message || 'Failed to initiate verification',
      )
      setVerifyingAliasId(null)
    }
  }

  const handleVerifySubmit = async (): Promise<void> => {
    if (!verificationCode.trim()) {
      setVerificationCodeError('Please enter a verification code')
      return
    }
    if (!verifyingAliasId) {
      return
    }
    try {
      const result = await completeVerification(
        verifyingAliasId,
        verifyingAliasAddress,
        verificationCode,
      )
      if (result.isVerified) {
        void message.success('External email address verified successfully')
        setVerifyModalOpen(false)
        setVerifyingAliasId(null)
        setVerificationCode('')
        setVerificationCodeError(null)
        void listEmailAliasesHandler()
      } else {
        if (result.reason) {
          void message.error(result.reason)
        } else {
          void message.error('Verification failed')
        }
      }
    } catch (error) {
      void message.error((error as Error).message || 'Verification failed')
    }
  }

  const handleVerifyCancel = (): void => {
    setVerifyModalOpen(false)
    setVerifyingAliasId(null)
    setVerificationCode('')
    setVerificationCodeError(null)
  }

  return (
    <Card title="Email Aliases">
      <ErrorBoundary
        error={
          emailAliasesError ??
          deprovisionEmailAliasError ??
          updateEmailAliasError ??
          enableEmailAliasError ??
          disableEmailAliasError
        }
      >
        <Form form={form} component={false}>
          <Table
            dataSource={emailAliases.filter((alias) =>
              showExternal
                ? alias.realAddressType === EmailAliasRealAddressType.EXTERNAL
                : alias.realAddressType === EmailAliasRealAddressType.INTERNAL,
            )}
            rowKey="id"
            loading={
              emailAliasesLoading ||
              updateEmailAliasLoading ||
              deprovisionEmailAliasLoading ||
              enableEmailAliasLoading ||
              disableEmailAliasLoading
            }
            columns={[
              {
                title: showExternal
                  ? 'External Alias Address'
                  : 'Alias Address',
                dataIndex: 'aliasAddress',
              },
              {
                title: 'Real Email Address',
                dataIndex: 'realAddress',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (status: EmailAliasStatus) => (
                  <Tag
                    color={
                      status === EmailAliasStatus.ENABLED ? 'blue' : 'orange'
                    }
                    style={{ margin: 0 }}
                  >
                    {status}
                  </Tag>
                ),
              },
              {
                title: 'Metadata',
                dataIndex: 'metadata',
                render: (colData, rowData) => {
                  const emailAlias = rowData as EmailAlias
                  const editing = isEditing(emailAlias)

                  return editing ? (
                    <Form.Item name="metadata" style={{ margin: 0 }}>
                      <Input.TextArea rows={4} placeholder='{"prop1": "abc"}' />
                    </Form.Item>
                  ) : (
                    <>{colData ? JSON.stringify(colData) : '-'} </>
                  )
                },
              },
              {
                title: 'Expires at',
                dataIndex: 'expiresAt',
                render: (_, rowData) => {
                  const emailAlias = rowData as EmailAlias
                  const editing = isEditing(emailAlias)

                  return editing ? (
                    <Form.Item name="expiresAt" style={{ margin: 0 }}>
                      <DatePicker showTime />
                    </Form.Item>
                  ) : (
                    <>
                      {emailAlias.expiresAt
                        ? dayjs(emailAlias.expiresAt).format('YYYY-MM-DD HH:mm')
                        : '-'}
                    </>
                  )
                },
              },
              {
                render: (_, rowData) => {
                  const emailAlias = rowData as EmailAlias
                  const editing = isEditing(emailAlias)

                  const { aliasAddress: emailAliasValue } = emailAlias
                  const isVerifyingThis =
                    verifyingAliasId === emailAlias.id && verifyLoading

                  return (
                    <ButtonsWrapper>
                      {editing ? (
                        <>
                          <StyledLinkButton
                            onClick={async () => {
                              await updateEmailAlias(emailAlias)
                              setEditingId(undefined)
                            }}
                          >
                            Save
                          </StyledLinkButton>

                          <StyledLinkButton
                            onClick={() => {
                              setEditingId(undefined)
                              form.resetFields()
                            }}
                          >
                            Cancel
                          </StyledLinkButton>
                        </>
                      ) : showExternal &&
                        emailAlias.status === EmailAliasStatus.PENDING ? (
                        <Button
                          type="primary"
                          loading={isVerifyingThis}
                          disabled={isVerifyingThis}
                          onClick={() => handleVerifyClick(emailAlias)}
                        >
                          Verify
                        </Button>
                      ) : (
                        <>
                          <StyledLinkButton
                            id={`email-address-${emailAliasValue}-edit-button`}
                            onClick={() => {
                              setEditingId(emailAlias.id)
                              form.setFieldsValue({
                                metadata: emailAlias.metadata
                                  ? JSON.stringify(emailAlias.metadata)
                                  : undefined,
                                expiresAt: emailAlias.expiresAt
                                  ? dayjs(emailAlias.expiresAt)
                                  : undefined,
                              })
                            }}
                          >
                            Update
                          </StyledLinkButton>
                          {emailAlias.status === EmailAliasStatus.ENABLED ? (
                            <StyledLinkButton
                              id={`email-address-${emailAlias.aliasAddress}-disable-button`}
                              onClick={() => disableEmailAlias(emailAlias)}
                            >
                              Disable
                            </StyledLinkButton>
                          ) : (
                            <StyledLinkButton
                              id={`email-address-${emailAlias.aliasAddress}-enable-button`}
                              onClick={() => enableEmailAlias(emailAlias)}
                            >
                              Enable
                            </StyledLinkButton>
                          )}
                          <DangerLink
                            id={`email-address-${emailAliasValue}-delete-button`}
                            onClick={() => deprovisionEmailAlias(emailAlias)}
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
        </Form>

        <Modal
          title="Verify External Email Address"
          open={verifyModalOpen}
          onOk={handleVerifySubmit}
          onCancel={handleVerifyCancel}
          okText="Submit"
          cancelText="Cancel"
          confirmLoading={verifyLoading}
          okButtonProps={{ disabled: verifyLoading }}
        >
          <p>
            A verification code has been sent to your external email address.
            Enter the code below to complete verification.
          </p>
          <Input
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => {
              setVerificationCode(e.target.value)
              setVerificationCodeError(null)
            }}
            status={verificationCodeError ? 'error' : undefined}
            onPressEnter={handleVerifySubmit}
          />
          {verificationCodeError && (
            <span style={{ color: '#ff4d4f', fontSize: 12 }}>
              {verificationCodeError}
            </span>
          )}
        </Modal>
      </ErrorBoundary>
    </Card>
  )
}
