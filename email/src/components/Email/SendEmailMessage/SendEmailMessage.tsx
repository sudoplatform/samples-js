import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react'
import { ErrorBoundary, useErrorBoundary } from '@components/ErrorBoundary'
import { Input, Form } from '@sudoplatform/web-ui'
import { Button } from '@components/Button'
import { useSendEmailMessageForm } from './SendEmailMessage.hooks'
import {
  SubmitButtonContainer,
  FormItem,
  AttachmentListItem,
} from './SendEmailMessage.styled'
import { EmailAddressesFormItem } from './EmailAddressesFormItem'
import TextArea from 'antd/lib/input/TextArea'
import { message, Space } from 'antd'
import { EmailContext } from '@contexts/index'
import { parseMessage, ParsedMessage } from '@util/MessageParser'
import { DraftEmailMessage, EmailMessage } from '@sudoplatform/sudo-email'
import { DraftsDropdown } from './DraftsDropdown/DraftsDropdown'
import { EncryptedIndicator } from './EncryptedIndicator'
import { DeleteOutlined } from '@ant-design/icons'

import { DraftEmailMessagesContext } from '../../../contexts/DraftEmailMessagesContext'

interface Props {
  replyingToMessage?: EmailMessage
  forwardingMessage?: EmailMessage
  onExit: () => void
}

/**
 * Form component that allows a user to send an email message
 * from the current active email address and handle drafts.
 */
export const SendEmailMessage = ({
  replyingToMessage,
  forwardingMessage,
  onExit,
}: Props): React.ReactElement => {
  const {
    loading: sendEmailMessageLoading,
    buttonDisabled: draftDisabled,
    error: sendEmailMessageError,
    form,
    attachmentsList,
    onFormSubmit,
    changesInForm,
    createDraftEmailMessageHandler,
    getDraftEmailMessageHandler,
    deleteDraftEmailMessagesHandler,
    onFileUpload,
    onDeleteAttachment,
    scheduleSendMessagesHandler,
    cancelScheduledMessageHandler,
  } = useSendEmailMessageForm()
  const [toEmailAddresses, setToEmailAddresses] = useState<string[]>([])
  const [ccEmailAddresses, setCcEmailAddresses] = useState<string[]>([])
  const [bccEmailAddresses, setBccEmailAddresses] = useState<string[]>([])
  const [selectedDraft, setSelectedDraft] = useState<string>()
  const [fileUploading, setFileUploading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { error, setError, clearError } = useErrorBoundary()
  const { activeEmailAddress } = useContext(EmailContext)
  const {
    draftsLoading,
    scheduledMessagesLoading,
    listDraftEmailMessagesHandler,
  } = useContext(DraftEmailMessagesContext)

  /* eslint-disable */
  useEffect(() => {
    void getDrafts()

    if (replyingToMessage) {
      // Appent data to subject and body to indicate message is replying to another
      let subjectField = replyingToMessage.subject as string
      if (!subjectField || subjectField.length === 0) {
        subjectField = '(no subject)'
      }
      form.setFieldValue('subject', `Re: ${subjectField}`)
      setToEmailAddresses(
        replyingToMessage.to.map(({ emailAddress }) => emailAddress),
      )
    } else if (forwardingMessage) {
      // Append data to subject and body to indicate message is forwarding another
      let subjectField = forwardingMessage.subject as string
      if (!subjectField || subjectField.length === 0) {
        subjectField = '(no subject)'
      }
      form.setFieldValue('subject', `Fwd: ${subjectField}`)
    }
  }, [replyingToMessage, forwardingMessage])
  /* eslint-enable */

  const decodeAndParseMessage = async (
    messageToDecodeAndParse: DraftEmailMessage | undefined,
  ): Promise<ParsedMessage> => {
    const decodedText = new TextDecoder().decode(
      messageToDecodeAndParse?.rfc822Data,
    )
    return await parseMessage(decodedText)
  }

  const saveDraft = async () => {
    if (!activeEmailAddress) {
      return
    }
    try {
      const draftEmailFormItems = {
        senderEmailAddress: activeEmailAddress,
        subject: (form.getFieldValue('subject') as string) ?? '',
        messageBody: (form.getFieldValue('messageBody') as string) ?? '',
        toEmailAddresses,
        ccEmailAddresses,
        bccEmailAddresses,
        attachments: attachmentsList,
      }

      const metadata = await createDraftEmailMessageHandler(draftEmailFormItems)
      void getDrafts()
      void message.success('Draft email has been saved')
      setSelectedDraft(metadata.id)
    } catch (error) {
      console.log(error)
    }
  }

  const clearForm = (): void => {
    // Reset form fields to default (except sender email address).
    form.resetFields([
      'toEmailAddresses',
      'ccEmailAddresses',
      'bccEmailAddresses',
      'subject',
      'messageBody',
    ])

    // Reset any stored recipient email addresses.
    setToEmailAddresses([])
    setCcEmailAddresses([])
    setBccEmailAddresses([])

    setSelectedDraft(undefined)
  }

  const getDrafts = async () => {
    await listDraftEmailMessagesHandler()
  }

  const populateForm = useCallback(
    (decodedDraft: ParsedMessage) => {
      // Clear form fields
      form.resetFields([
        'toEmailAddresses',
        'ccEmailAddresses',
        'bccEmailAddresses',
        'subject',
        'messageBody',
      ])

      // Set form values (this might trigger changesInForm, but that's OK after reset)
      form.setFieldsValue({
        subject: decodedDraft.subject,
        messageBody: decodedDraft.text,
      })

      // Update state arrays
      setToEmailAddresses(decodedDraft.to?.map((addr) => addr.address) || [])
      setCcEmailAddresses(decodedDraft.cc?.map((addr) => addr.address) || [])
      setBccEmailAddresses(decodedDraft.bcc?.map((addr) => addr.address) || [])

      // Show warning for empty drafts
      if (
        !decodedDraft.subject &&
        !decodedDraft.text &&
        !decodedDraft.to &&
        !decodedDraft.cc &&
        !decodedDraft.bcc
      ) {
        void message.warning('Editing empty draft')
      }
    },
    [form],
  )

  const onDraftSelect = async (selectedSavedDraftId: string) => {
    const draftData = await getDraftEmailMessageHandler(selectedSavedDraftId)
    const decodedDraft = await decodeAndParseMessage(draftData)
    populateForm(decodedDraft)
    setSelectedDraft(selectedSavedDraftId)
  }

  const deleteDraft = async () => {
    try {
      const draftArray: string[] = []
      if (selectedDraft) {
        draftArray.push(selectedDraft)
      }
      await deleteDraftEmailMessagesHandler(draftArray)
      void getDrafts()
      void message.success('Draft has been deleted')
      setSelectedDraft(undefined)
    } catch (error) {
      setError(error as Error, 'Failed to delete draft email message')
      console.log(error)
      throw error
    }
  }

  const submitForm = async () => {
    try {
      await onFormSubmit({
        toEmailAddresses,
        ccEmailAddresses,
        bccEmailAddresses,
        replyingMessageId: replyingToMessage?.id,
        forwardingMessageId: forwardingMessage?.id,
      })

      void message.success('Email message sent successfully!')

      clearForm()
      onExit()
    } catch (error) {
      console.log(error)
    }
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.debug(e.target.files?.item(0))
    setFileUploading(true)
    const file = e.target.files?.item(0)
    if (file) {
      await onFileUpload(file)
    }
    setFileUploading(false)
  }

  const inputEmailAddresses = useMemo(
    () =>
      Array.from(
        new Set([
          ...toEmailAddresses,
          ...ccEmailAddresses,
          ...bccEmailAddresses,
        ]),
      ),
    [toEmailAddresses, ccEmailAddresses, bccEmailAddresses],
  )

  return (
    <div id="send-email-message-card">
      <DraftsDropdown
        selectedDraftId={selectedDraft}
        onChange={onDraftSelect}
        deleteDraft={deleteDraft}
        scheduleSendMessagesHandler={scheduleSendMessagesHandler}
        setError={setError}
      />
      <ErrorBoundary error={sendEmailMessageError}>
        <EncryptedIndicator emailAddresses={inputEmailAddresses} />
        <Form form={form} requiredMark={true} onChange={changesInForm}>
          <FormItem name="senderEmailAddress" label="Sender Email Address">
            <Input disabled={true} />
          </FormItem>
          <EmailAddressesFormItem
            fieldName="toEmailAddresses"
            fieldLabel="To:"
            form={form}
            required={true}
            emailAddresses={toEmailAddresses}
            setEmailAddresses={setToEmailAddresses}
          />
          <EmailAddressesFormItem
            fieldName="ccEmailAddresses"
            fieldLabel="Cc:"
            form={form}
            emailAddresses={ccEmailAddresses}
            setEmailAddresses={setCcEmailAddresses}
          />
          <EmailAddressesFormItem
            fieldName="bccEmailAddresses"
            fieldLabel="Bcc:"
            form={form}
            emailAddresses={bccEmailAddresses}
            setEmailAddresses={setBccEmailAddresses}
          />
          <FormItem
            name="subject"
            label="Subject"
            rules={[
              {
                required: true,
                message: "'Subject' required",
              },
            ]}
          >
            <Input disabled={sendEmailMessageLoading} />
          </FormItem>
          <FormItem
            name="messageBody"
            label="Message Body"
            rules={[
              {
                required: true,
                message: "'Message' required",
              },
            ]}
          >
            <TextArea />
          </FormItem>
          {attachmentsList.map((a, idx) => (
            <AttachmentListItem key={a.filename}>
              <Button
                type="button"
                key={a.filename}
                onClick={() => onDeleteAttachment(idx)}
              >
                <DeleteOutlined />
              </Button>
              {a.filename}
            </AttachmentListItem>
          ))}
          <SubmitButtonContainer>
            <Space size="middle">
              <Button
                className="provision-email-submit-button"
                type="submit"
                loading={
                  sendEmailMessageLoading ||
                  draftsLoading ||
                  scheduledMessagesLoading
                }
                disabled={draftDisabled}
                onClick={submitForm}
                kind="primary"
              >
                Send
              </Button>
              <input
                type="file"
                onChange={onFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <Button
                className="add-attachment-button"
                type="button"
                loading={
                  sendEmailMessageLoading ||
                  fileUploading ||
                  draftsLoading ||
                  scheduledMessagesLoading
                }
                disabled={sendEmailMessageLoading}
                onClick={() => fileInputRef.current?.click()}
              >
                Add attachment
              </Button>
              <Button
                className="draft-email-save-button"
                type="button"
                loading={draftsLoading || scheduledMessagesLoading}
                disabled={draftDisabled || sendEmailMessageLoading}
                onClick={saveDraft}
              >
                Save Draft
              </Button>
              <Button
                loading={draftsLoading || scheduledMessagesLoading}
                onClick={() => {
                  clearForm()
                  onExit()
                }}
              >
                Back
              </Button>
              <Button
                className="form-clear-button"
                type="button"
                loading={draftsLoading || scheduledMessagesLoading}
                disabled={draftDisabled}
                kind="primary"
                onClick={clearForm}
              >
                Clear Form
              </Button>
            </Space>
          </SubmitButtonContainer>
        </Form>
      </ErrorBoundary>
    </div>
  )
}
