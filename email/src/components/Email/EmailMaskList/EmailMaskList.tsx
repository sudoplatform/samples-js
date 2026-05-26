import React, { useContext, useState } from 'react'
import {
  EmailMask,
  EmailMaskRealAddressType,
  EmailMaskStatus,
} from '@sudoplatform/sudo-email'
import { TableCard as Card } from '@components/Card'
import { Table, DangerLink } from '@components/Table'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { useUpdateEmailMask } from '@hooks/useUpdateEmailMask'
import { useEmailMaskDeprovision } from '@hooks/useEmailMaskDeprovision'
import { useEmailMaskDisable } from '@hooks/useEmailMaskDisable'
import { useEmailMaskEnable } from '@hooks/useEmailMaskEnable'
import { useVerifyExternalEmail } from '@hooks/useVerifyExternalEmail'
import { StyledLinkButton, ButtonsWrapper } from './EmailMaskList.styled'
import { message, Tag, Form, Input, DatePicker, Button, Modal } from 'antd'
import { EmailMaskContext } from '@contexts/EmailMaskContext'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

export interface EmailMaskInputs {
  expiresAt?: Dayjs
  metadata?: string
}

interface EmailMaskListProps {
  showExternal: boolean
}

/**
 * Component that renders the list of email mask from `<EmailMaskContext>`.
 */
export const EmailMaskList = ({
  showExternal,
}: EmailMaskListProps): React.ReactElement => {
  const {
    emailMasks,
    emailMasksLoading,
    emailMasksError,
    listEmailMasksHandler,
  } = useContext(EmailMaskContext)

  const {
    deprovisionEmailMaskLoading,
    deprovisionEmailMaskError,
    deprovisionEmailMaskHandler,
  } = useEmailMaskDeprovision()

  const {
    enableEmailMaskLoading,
    enableEmailMaskError,
    enableEmailMaskHandler,
  } = useEmailMaskEnable()

  const {
    disableEmailMaskLoading,
    disableEmailMaskError,
    disableEmailMaskHandler,
  } = useEmailMaskDisable()

  const {
    updateEmailMaskError,
    updateEmailMaskLoading,
    updateEmailMaskHandler,
  } = useUpdateEmailMask()

  const { verifyLoading, initiateVerification, completeVerification } =
    useVerifyExternalEmail()

  const [verifyingMaskId, setVerifyingMaskId] = useState<string | null>(null)
  const [verifyingMaskAddress, setVerifyingMaskAddress] = useState<string>('')
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationCodeError, setVerificationCodeError] = useState<
    string | null
  >(null)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [form] = Form.useForm<EmailMaskInputs>()

  const isEditing = (record: EmailMask) => record.id === editingId

  /**
   * Handler function to invoke the email deprovision API for a given
   * email address.
   */
  const deprovisionEmailMask = async (emailMask: EmailMask): Promise<void> => {
    try {
      await deprovisionEmailMaskHandler(emailMask)

      void message.success(
        `Email mask '${emailMask.maskAddress}' deprovisioned for Email Address '${emailMask.realAddress}'`,
      )
      void listEmailMasksHandler()
    } catch (error) {
      void message.error('Failed to deprovision email mask')
    }
  }

  const disableEmailMask = async (emailMask: EmailMask): Promise<void> => {
    try {
      await disableEmailMaskHandler(emailMask)

      void message.success(
        `Email mask '${emailMask.maskAddress}' disabled for Email Address '${emailMask.realAddress}'`,
      )
      void listEmailMasksHandler()
    } catch (error) {
      void message.error('Failed to disable email mask')
    }
  }

  const enableEmailMask = async (emailMask: EmailMask): Promise<void> => {
    try {
      await enableEmailMaskHandler(emailMask)

      void message.success(
        `Email mask '${emailMask.maskAddress}' enabled for Email Address '${emailMask.realAddress}'`,
      )
      void listEmailMasksHandler()
    } catch (error) {
      void message.error('Failed to enable email mask')
    }
  }

  const updateEmailMask = async (emailMask: EmailMask): Promise<void> => {
    let values: EmailMaskInputs
    try {
      values = await form.validateFields()
    } catch {
      // Form validation failed — Ant Design shows inline errors
      return
    }
    try {
      await updateEmailMaskHandler(emailMask, values.metadata, values.expiresAt)
      void listEmailMasksHandler()
    } catch (error) {
      void message.error('Failed to update email mask')
    }
  }

  const handleVerifyClick = async (emailMask: EmailMask): Promise<void> => {
    setVerifyingMaskId(emailMask.id)
    setVerifyingMaskAddress(emailMask.realAddress)
    try {
      await initiateVerification(emailMask.id, emailMask.realAddress)
      setVerifyModalOpen(true)
      setVerificationCode('')
      setVerificationCodeError(null)
    } catch (error) {
      void message.error(
        (error as Error).message || 'Failed to initiate verification',
      )
      setVerifyingMaskId(null)
    }
  }

  const handleVerifySubmit = async (): Promise<void> => {
    if (!verificationCode.trim()) {
      setVerificationCodeError('Please enter a verification code')
      return
    }
    if (!verifyingMaskId) {
      return
    }
    try {
      const result = await completeVerification(
        verifyingMaskId,
        verifyingMaskAddress,
        verificationCode,
      )
      if (result.isVerified) {
        void message.success('External email address verified successfully')
        setVerifyModalOpen(false)
        setVerifyingMaskId(null)
        setVerificationCode('')
        setVerificationCodeError(null)
        void listEmailMasksHandler()
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
    setVerifyingMaskId(null)
    setVerificationCode('')
    setVerificationCodeError(null)
  }

  return (
    <Card title="Email Masks">
      <ErrorBoundary
        error={
          emailMasksError ??
          deprovisionEmailMaskError ??
          updateEmailMaskError ??
          enableEmailMaskError ??
          disableEmailMaskError
        }
      >
        <Form form={form} component={false}>
          <Table
            dataSource={emailMasks.filter((mask) =>
              showExternal
                ? mask.realAddressType === EmailMaskRealAddressType.EXTERNAL
                : mask.realAddressType === EmailMaskRealAddressType.INTERNAL,
            )}
            rowKey="id"
            loading={
              emailMasksLoading ||
              updateEmailMaskLoading ||
              deprovisionEmailMaskLoading ||
              enableEmailMaskLoading ||
              disableEmailMaskLoading
            }
            columns={[
              {
                title: showExternal ? 'External Mask Address' : 'Mask Address',
                dataIndex: 'maskAddress',
              },
              {
                title: 'Real Email Address',
                dataIndex: 'realAddress',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (status: EmailMaskStatus) => (
                  <Tag
                    color={
                      status === EmailMaskStatus.ENABLED ? 'blue' : 'orange'
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
                  const emailMask = rowData as EmailMask
                  const editing = isEditing(emailMask)

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
                  const emailMask = rowData as EmailMask
                  const editing = isEditing(emailMask)

                  return editing ? (
                    <Form.Item name="expiresAt" style={{ margin: 0 }}>
                      <DatePicker showTime />
                    </Form.Item>
                  ) : (
                    <>
                      {emailMask.expiresAt
                        ? dayjs(emailMask.expiresAt).format('YYYY-MM-DD HH:mm')
                        : '-'}
                    </>
                  )
                },
              },
              {
                render: (_, rowData) => {
                  const emailMask = rowData as EmailMask
                  const editing = isEditing(emailMask)

                  const { maskAddress: emailMaskValue } = emailMask
                  const isVerifyingThis =
                    verifyingMaskId === emailMask.id && verifyLoading

                  return (
                    <ButtonsWrapper>
                      {editing ? (
                        <>
                          <StyledLinkButton
                            onClick={async () => {
                              await updateEmailMask(emailMask)
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
                        emailMask.status === EmailMaskStatus.PENDING ? (
                        <Button
                          type="primary"
                          loading={isVerifyingThis}
                          disabled={isVerifyingThis}
                          onClick={() => handleVerifyClick(emailMask)}
                        >
                          Verify
                        </Button>
                      ) : (
                        <>
                          <StyledLinkButton
                            id={`email-address-${emailMaskValue}-edit-button`}
                            onClick={() => {
                              setEditingId(emailMask.id)
                              form.setFieldsValue({
                                metadata: emailMask.metadata
                                  ? JSON.stringify(emailMask.metadata)
                                  : undefined,
                                expiresAt: emailMask.expiresAt
                                  ? dayjs(emailMask.expiresAt)
                                  : undefined,
                              })
                            }}
                          >
                            Update
                          </StyledLinkButton>
                          {emailMask.status === EmailMaskStatus.ENABLED ? (
                            <StyledLinkButton
                              id={`email-address-${emailMask.maskAddress}-disable-button`}
                              onClick={() => disableEmailMask(emailMask)}
                            >
                              Disable
                            </StyledLinkButton>
                          ) : (
                            <StyledLinkButton
                              id={`email-address-${emailMask.maskAddress}-enable-button`}
                              onClick={() => enableEmailMask(emailMask)}
                            >
                              Enable
                            </StyledLinkButton>
                          )}
                          <DangerLink
                            id={`email-address-${emailMaskValue}-delete-button`}
                            onClick={() => deprovisionEmailMask(emailMask)}
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
