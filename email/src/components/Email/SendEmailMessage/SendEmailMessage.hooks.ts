import { useContext, useEffect, useState } from 'react'
import { EmailContext, ProjectContext } from '@contexts'
import { useErrorBoundary } from '@components/ErrorBoundary'
import {
  EmailAddress,
  EmailAttachment,
  EmailMessageOperationFailureResult,
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

interface FormInputs {
  senderEmailAddress: string
  recipientEmailAddresses?: string
  ccEmailAddresses?: string
  bccEmailAddresses?: string
  subject: string
  messageBody: string
}

interface FormSubmitParams {
  recipientEmailAddresses: string[]
  ccEmailAddresses: string[]
  bccEmailAddresses: string[]
}

interface EmailMessageParams extends FormSubmitParams {
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
const formatEmailMessage = ({
  senderEmailAddress,
  recipientEmailAddresses,
  ccEmailAddresses,
  bccEmailAddresses,
  subject,
  messageBody,
}: EmailMessageParams): string => {
  const date = moment(new Date()).format('ddd, DD MMM YYYY HH:mm:ss ZZ')

  return (
    `Date: ${date}\n` +
    `To: ${recipientEmailAddresses.join(', ')}\n` +
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
  const [form] = useForm<FormInputs>()
  const [loading, setLoading] = useState(false)
  const [draftLoading, setDraftLoading] = useState(false)
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
      const result = await sudoEmailClient.sendEmailMessage({
        senderEmailAddressId: emailMessageParams.senderEmailAddress.id,
        attachments: emailMessageParams.attachments,
        body: emailMessageParams.messageBody,
        inlineAttachments: [],
        emailMessageHeader: {
          from: {
            emailAddress: emailMessageParams.senderEmailAddress.emailAddress,
            displayName: emailMessageParams.senderEmailAddress.alias,
          },
          to: emailMessageParams.recipientEmailAddresses.map((a) => ({
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
      })
      return result.id
    } catch (error) {
      setError(error as Error, 'Failed to send email message')
      throw error
    }
  }

  const createDraftEmailMessageHandler = async (
    emailMessageParams: EmailMessageParams,
  ): Promise<DraftEmailMessageMetadata> => {
    clearError()
    setDraftLoading(true)
    try {
      const draftMetadata = formatEmailMessage(emailMessageParams)

      return await sudoEmailClient.createDraftEmailMessage({
        rfc822Data: Buffer.from(draftMetadata),
        senderEmailAddressId: emailMessageParams.senderEmailAddress.id,
      })
    } catch (error) {
      setError(error as Error, 'Failed to save a draft email message')
      throw error
    } finally {
      setDraftLoading(false)
    }
  }

  const getDraftEmailMessageHandler = async (
    draftEmailId: string,
    activeEmailAddress: EmailAddress,
  ): Promise<DraftEmailMessage | undefined> => {
    const emailAddressId = activeEmailAddress.id
    return await sudoEmailClient.getDraftEmailMessage({
      emailAddressId,
      id: draftEmailId,
    })
  }

  const listDraftEmailMessageIdsHandler = async (
    activeEmailAddress: EmailAddress,
  ): Promise<string[]> => {
    const emailAddressId = activeEmailAddress.id
    const draftMetadata = await sudoEmailClient.listDraftEmailMessageMetadata()
    return draftMetadata.map((m) => m.id)
  }

  const listDraftEmailMessageMetadataHandler = async (
    activeEmailAddress: EmailAddress,
  ): Promise<DraftEmailMessageMetadata[]> => {
    const emailAddressId = activeEmailAddress.id
    return await sudoEmailClient.listDraftEmailMessageMetadata()
  }

  const deleteDraftEmailMessagesHandler = async (
    ids: string[],
    activeEmailAddress: EmailAddress,
  ): Promise<
    BatchOperationResult<string, EmailMessageOperationFailureResult>
  > => {
    try {
      setDraftLoading(true)
      const emailAddressId = activeEmailAddress.id
      return await sudoEmailClient.deleteDraftEmailMessages({
        emailAddressId,
        ids,
      })
    } finally {
      setDraftLoading(false)
    }
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
      const recipientEmailAddresses = form.getFieldValue(
        'recipientEmailAddresses',
      ) as string
      const subject = form.getFieldValue('subject') as string
      const messageBody = form.getFieldValue('messageBody') as string

      setButtonDisabled(
        messageBody === '' && subject === '' && recipientEmailAddresses === '',
      )
    } catch (err) {
      setButtonDisabled(true)
    }
  }

  return {
    form,
    loading,
    draftLoading,
    buttonDisabled,
    error,
    attachmentsList,
    onFormSubmit,
    changesInForm,
    createDraftEmailMessageHandler,
    getDraftEmailMessageHandler: (draftEmailId: string) => {
      return activeEmailAddress
        ? getDraftEmailMessageHandler(draftEmailId, activeEmailAddress)
        : undefined
    },
    listDraftEmailMessageIdsHandler: () => {
      return activeEmailAddress
        ? listDraftEmailMessageIdsHandler(activeEmailAddress)
        : undefined
    },
    listDraftEmailMessageMetadataHandler: () => {
      return activeEmailAddress
        ? listDraftEmailMessageMetadataHandler(activeEmailAddress)
        : undefined
    },
    deleteDraftEmailMessagesHandler: (ids: string[]) => {
      return activeEmailAddress
        ? deleteDraftEmailMessagesHandler(ids, activeEmailAddress)
        : undefined
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
