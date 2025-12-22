import { useContext, useEffect, useState } from 'react'
import { EmailContext, ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'
import {
  DeleteEmailMessageSuccessResult,
  EmailAddress,
  EmailAttachment,
  EmailMessageOperationFailureResult,
  SendEmailMessageInput,
} from '@sudoplatform/sudo-email'
import { useForm } from '@sudoplatform/web-ui'
import moment from 'moment'
import { useActiveSudoUpdate } from '@hooks/useActiveSudoUpdate'
import {
  DraftEmailMessageMetadata,
  BatchOperationResult,
  DraftEmailMessage,
} from '@sudoplatform/sudo-email'
import { Base64 } from '@sudoplatform/sudo-common'
import { DraftEmailMessagesContext } from '../../../contexts/DraftEmailMessagesContext'

interface FormInputs {
  senderEmailAddress: string
  toEmailAddresses?: string
  ccEmailAddresses?: string
  bccEmailAddresses?: string
  subject: string
  messageBody: string
}

interface FormSubmitParams {
  toEmailAddresses: string[]
  ccEmailAddresses: string[]
  bccEmailAddresses: string[]
  replyingMessageId?: string
  forwardingMessageId?: string
}

export interface EmailMessageParams extends FormSubmitParams {
  senderEmailAddress: EmailAddress
  subject: string
  messageBody: string
  attachments: EmailAttachment[]
}

/**
 * Creates an RFC822-formatted email message as a string.
 *
 * RFC822: https://learn.microsoft.com/en-us/previous-versions/office/developer/exchange-server-2010/aa563032(v=exchg.140)
 */
export const formatEmailMessage = ({
  senderEmailAddress,
  toEmailAddresses,
  ccEmailAddresses,
  bccEmailAddresses,
  subject,
  messageBody,
}: EmailMessageParams): string => {
  const date = moment(new Date()).format('ddd, DD MMM YYYY HH:mm:ss ZZ')

  return (
    `Date: ${date}\n` +
    `To: ${toEmailAddresses.join(', ')}\n` +
    `From: ${senderEmailAddress.emailAddress}\n` +
    (ccEmailAddresses.length !== 0
      ? `cc: ${ccEmailAddresses.join(', ')}\n`
      : '') +
    (bccEmailAddresses.length !== 0
      ? `bcc: ${bccEmailAddresses.join(', ')}\n`
      : '') +
    `Subject: ${subject}\n\n${messageBody}`
  )
}

/**
 * Hook that handles the form and email message sending
 * logic for the `<SendEmailMessage>` component.
 *
 * Implements the Sudo Email SDK method `sendEmailMessage`.
 */
export const useSendEmailMessageForm = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { activeEmailAddress } = useContext(EmailContext)
  const {
    draftMessagesMetadataList,
    draftsLoading,
    listDraftEmailMessagesHandler,
    scheduledMessages,
    createDraftEmailMessageHandler,
    deleteDraftEmailMessagesHandler,
    getDraftEmailMessageHandler,
    cancelScheduledMessageHandler,
    scheduleSendMessagesHandler,
    scheduledMessagesLoading,
  } = useContext(DraftEmailMessagesContext)
  const [form] = useForm<FormInputs>()
  const [loading, setLoading] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [attachmentsList, setAttachmentsList] = useState<EmailAttachment[]>([])
  const { error, setError, clearError } = useErrorBoundary()

  /* Set the value of the 'sender' field with active email address.
  (the value in this field isn't used, only rendered to show the
  sending email address) */
  useEffect(() => {
    if (activeEmailAddress) {
      form.setFieldValue('senderEmailAddress', activeEmailAddress.emailAddress)
    }
  }, [activeEmailAddress, form])

  // Clear any existing errors on update of active sudo.
  useActiveSudoUpdate(clearError)

  // Wrapper function to send email message and set UI if fail occurs.
  const sendEmailMessageHandler = async (
    emailMessageParams: EmailMessageParams,
  ): Promise<string> => {
    clearError()

    try {
      const input: SendEmailMessageInput = {
        senderEmailAddressId: emailMessageParams.senderEmailAddress.id,
        attachments: emailMessageParams.attachments,
        body: emailMessageParams.messageBody,
        inlineAttachments: [],
        emailMessageHeader: {
          from: {
            emailAddress: emailMessageParams.senderEmailAddress.emailAddress,
            displayName: emailMessageParams.senderEmailAddress.alias,
          },
          to: emailMessageParams.toEmailAddresses.map((a) => ({
            emailAddress: a,
          })),
          cc: emailMessageParams.ccEmailAddresses.map((a) => ({
            emailAddress: a,
          })),
          bcc: emailMessageParams.bccEmailAddresses.map((a) => ({
            emailAddress: a,
          })),
          replyTo: [],
          subject: emailMessageParams.subject,
        },
      }
      if (emailMessageParams.replyingMessageId) {
        input.replyingMessageId = emailMessageParams.replyingMessageId
      } else if (emailMessageParams.forwardingMessageId) {
        input.forwardingMessageId = emailMessageParams.forwardingMessageId
      }
      const result = await sudoEmailClient.sendEmailMessage(input)

      return result.id
    } catch (error) {
      setError(error as Error, 'Failed to send email message')
      throw error
    }
  }

  const createDraftEmailMessage = async (
    emailMessageParams: EmailMessageParams,
  ): Promise<DraftEmailMessageMetadata> => {
    clearError()
    try {
      const draftMetadata = formatEmailMessage(emailMessageParams)
      return createDraftEmailMessageHandler(draftMetadata)
    } catch (error) {
      setError(error as Error, 'Failed to save a draft email message')
      throw error
    }
  }

  const getDraftEmailMessage = async (
    draftEmailId: string,
  ): Promise<DraftEmailMessage | undefined> => {
    return await getDraftEmailMessageHandler(draftEmailId)
  }

  const listDraftEmailMessageIdsHandler = async (): Promise<string[]> => {
    await listDraftEmailMessagesHandler()
    return draftMessagesMetadataList.map((m) => m.id)
  }

  const listDraftEmailMessageMetadataHandler = async (
    activeEmailAddress: EmailAddress,
  ): Promise<DraftEmailMessageMetadata[]> => {
    await listDraftEmailMessagesHandler()
    return draftMessagesMetadataList
  }

  const deleteDraftEmailMessages = async (
    ids: string[],
  ): Promise<
    BatchOperationResult<
      DeleteEmailMessageSuccessResult,
      EmailMessageOperationFailureResult
    >
  > => {
    return await deleteDraftEmailMessagesHandler(ids)
  }

  // Wrapper function to get form fields and set UI error if fail occurs.
  const formValidateHandler = async (): Promise<FormInputs> => {
    clearError()

    try {
      return await form.validateFields()
    } catch (error) {
      setError(error as Error, 'Failed to validate fields')
      throw error
    }
  }

  /**
   * Pass form inputs (on successful validation) to send
   * message handler function.
   */
  const onFormSubmit = async (formSubmitParams: FormSubmitParams) => {
    setLoading(true)

    if (!sudoEmailClient) {
      throw new Error('Sudo email client not initialized')
    } else if (!activeEmailAddress) {
      throw new Error('No active email address set')
    }

    try {
      const fields = await formValidateHandler()
      await sendEmailMessageHandler({
        senderEmailAddress: activeEmailAddress,
        subject: fields.subject,
        messageBody: fields.messageBody,
        attachments: attachmentsList,
        ...formSubmitParams,
      })
    } finally {
      setLoading(false)
    }
  }

  const changesInForm = () => {
    try {
      const toEmailAddresses = form.getFieldValue('toEmailAddresses') as string
      const subject = form.getFieldValue('subject') as string
      const messageBody = form.getFieldValue('messageBody') as string

      setButtonDisabled(
        messageBody === '' && subject === '' && toEmailAddresses === '',
      )
    } catch (err) {
      setButtonDisabled(true)
    }
  }

  return {
    form,
    loading,
    draftsLoading,
    buttonDisabled,
    error,
    attachmentsList,
    onFormSubmit,
    changesInForm,
    scheduleSendMessagesHandler,
    scheduledMessages,
    scheduledMessagesLoading,
    cancelScheduledMessageHandler,
    createDraftEmailMessageHandler: createDraftEmailMessage,
    getDraftEmailMessageHandler: (draftEmailId: string) => {
      return activeEmailAddress ? getDraftEmailMessage(draftEmailId) : undefined
    },
    listDraftEmailMessageIdsHandler: () => {
      return activeEmailAddress ? listDraftEmailMessageIdsHandler() : undefined
    },
    listDraftEmailMessageMetadataHandler: () => {
      return activeEmailAddress
        ? listDraftEmailMessageMetadataHandler(activeEmailAddress)
        : undefined
    },
    deleteDraftEmailMessagesHandler: (ids: string[]) => {
      return activeEmailAddress ? deleteDraftEmailMessages(ids) : undefined
    },
    onFileUpload: async (file: File) => {
      const dataArrayBuffer = await file.arrayBuffer()
      const newAttachment: EmailAttachment = {
        data: Base64.encode(dataArrayBuffer),
        filename: file.name,
        inlineAttachment: false,
        mimeType: file.type,
        contentTransferEncoding: 'base64',
      }
      setAttachmentsList([...attachmentsList, newAttachment])
    },
    onDeleteAttachment: (index: number) => {
      setAttachmentsList(attachmentsList.filter((_, idx) => idx != index))
    },
  }
}
