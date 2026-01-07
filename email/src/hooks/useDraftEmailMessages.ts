import { useCallback, useContext, useState } from 'react'
import { message } from 'antd'
import { EmailContext, ProjectContext } from '@contexts/index'
import {
  BatchOperationResult,
  DeleteEmailMessageSuccessResult,
  DraftEmailMessage,
  DraftEmailMessageMetadata,
  EmailMessageOperationFailureResult,
  ScheduledDraftMessage,
  ScheduledDraftMessageState,
} from '@sudoplatform/sudo-email'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { NotSignedInError } from '@sudoplatform/sudo-common'
import { useActiveEmailAddressUpdate } from './useActiveEmailAddressUpdate'

/**
 * Hooks to provide functionality for draft email messages.
 * This includes listing, retrieving, deleting, and managing draft messages.
 */
export const useDraftEmailMessages = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { activeEmailAddress } = useContext(EmailContext)
  const [draftMessagesMetadataList, setDraftMessagesMetadataList] = useState<
    DraftEmailMessageMetadata[]
  >([])
  const [draftsLoading, setDraftsLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()
  const [scheduledMessages, setScheduledMessages] = useState<
    ScheduledDraftMessage[]
  >([])
  const [scheduledMessagesLoading, setScheduledMessagesLoading] =
    useState(false)

  const scheduleSendMessagesHandler = useCallback(
    async (id: string, sendAt: Date): Promise<void> => {
      if (!activeEmailAddress) {
        return
      }
      if (sendAt.getTime() < Date.now()) {
        void message.error('Scheduled time must be in the future')
        return
      }
      clearError()
      setScheduledMessagesLoading(true)
      try {
        const scheduledMessage = await sudoEmailClient.scheduleSendDraftMessage(
          {
            emailAddressId: activeEmailAddress.id,
            id,
            sendAt,
          },
        )
        setScheduledMessages((prev) => [...prev, scheduledMessage])
        void message.success('Message scheduled successfully')
      } catch (error) {
        setError(error as Error, 'Failed to schedule send message')
      } finally {
        setScheduledMessagesLoading(false)
      }
    },
    [
      setError,
      clearError,
      setScheduledMessagesLoading,
      activeEmailAddress,
      sudoEmailClient,
    ],
  )

  const cancelScheduledMessageHandler = useCallback(
    async (id: string): Promise<void> => {
      if (!activeEmailAddress) {
        return
      }
      clearError()
      setScheduledMessagesLoading(true)
      try {
        await sudoEmailClient.cancelScheduledDraftMessage({
          emailAddressId: activeEmailAddress.id,
          id,
        })
        setScheduledMessages((prev) => prev.filter((msg) => msg.id !== id))
      } catch (error) {
        setError(error as Error, 'Failed to cancel scheduled message')
      } finally {
        setScheduledMessagesLoading(false)
      }
    },
    [
      setError,
      clearError,
      setScheduledMessagesLoading,
      activeEmailAddress,
      sudoEmailClient,
    ],
  )

  const listScheduledMessagesHandler = useCallback(async (): Promise<void> => {
    if (!activeEmailAddress) {
      return
    }
    console.debug('listScheduledMessagesHandler called')
    clearError()
    setScheduledMessagesLoading(true)
    try {
      let nextToken: string | undefined = undefined
      let allItems: ScheduledDraftMessage[] = []
      do {
        console.debug('Fetching scheduled messages with nextToken:', {
          nextToken,
          allItems,
        })
        const listResult =
          await sudoEmailClient.listScheduledDraftMessagesForEmailAddressId({
            emailAddressId: activeEmailAddress.id,
            nextToken,
            filter: {
              state: { notEqual: ScheduledDraftMessageState.CANCELLED },
            },
          })
        console.debug('listResult', { listResult })
        allItems = [...allItems, ...listResult.items]
        nextToken = listResult.nextToken
      } while (nextToken !== undefined)
      console.debug('Scheduled messages retrieved:', { allItems })
      setScheduledMessages(allItems)
    } catch (error) {
      setError(error as Error, 'Failed to retrieve scheduled messages')
    } finally {
      setScheduledMessagesLoading(false)
    }
  }, [
    setError,
    clearError,
    setScheduledMessagesLoading,
    activeEmailAddress,
    sudoEmailClient,
  ])

  const listDraftEmailMessagesHandler = useCallback(async (): Promise<void> => {
    if (!activeEmailAddress) {
      return
    }
    clearError()
    setDraftsLoading(true)
    try {
      let nextToken: string | undefined = undefined
      let allItems: DraftEmailMessageMetadata[] = []
      do {
        const metadataList =
          await sudoEmailClient.listDraftEmailMessageMetadataForEmailAddressId({
            emailAddressId: activeEmailAddress.id,
            limit: 5,
            nextToken: nextToken,
          })

        allItems = [...allItems, ...metadataList.items]

        nextToken = metadataList.nextToken
        console.debug(
          'next token:',
          nextToken,
          metadataList.items.length,
          allItems.length,
        )
      } while (nextToken !== undefined && allItems.length < 50)
      setDraftMessagesMetadataList(allItems)
    } catch (error) {
      setError(error as Error, 'Failed to list draft email messages')
    } finally {
      setDraftsLoading(false)
    }
  }, [
    setError,
    clearError,
    setDraftsLoading,
    sudoEmailClient,
    activeEmailAddress,
  ])

  const createDraftEmailMessageHandler = useCallback(
    async (rfc822Data: string): Promise<DraftEmailMessageMetadata> => {
      if (!activeEmailAddress) {
        const error = new NotSignedInError()
        setError(error, 'No active email address found')
        throw error
      }
      clearError()
      setDraftsLoading(true)
      try {
        return await sudoEmailClient.createDraftEmailMessage({
          rfc822Data: Buffer.from(rfc822Data).buffer,
          senderEmailAddressId: activeEmailAddress.id,
        })
      } catch (error) {
        setError(error as Error, 'Failed to save a draft email message')
        throw error
      } finally {
        setDraftsLoading(false)
      }
    },
    [
      activeEmailAddress,
      clearError,
      setError,
      setDraftsLoading,
      sudoEmailClient,
    ],
  )

  const deleteDraftEmailMessagesHandler = useCallback(
    async (
      ids: string[],
    ): Promise<
      BatchOperationResult<
        DeleteEmailMessageSuccessResult,
        EmailMessageOperationFailureResult
      >
    > => {
      if (!activeEmailAddress) {
        const error = new NotSignedInError()
        setError(error, 'No active email address found')
        throw error
      }
      clearError()
      try {
        setDraftsLoading(true)
        const emailAddressId = activeEmailAddress.id
        return await sudoEmailClient.deleteDraftEmailMessages({
          emailAddressId,
          ids,
        })
      } catch (error) {
        setError(error as Error, 'Failed to delete draft email messages')
        throw error
      } finally {
        setDraftsLoading(false)
      }
    },
    [
      activeEmailAddress,
      setDraftsLoading,
      sudoEmailClient,
      setError,
      clearError,
    ],
  )

  const getDraftEmailMessageHandler = useCallback(
    async (draftEmailId: string): Promise<DraftEmailMessage | undefined> => {
      if (!activeEmailAddress) {
        const error = new NotSignedInError()
        setError(error, 'No active email address found')
        throw error
      }
      clearError()
      setDraftsLoading(true)
      try {
        return await sudoEmailClient.getDraftEmailMessage({
          emailAddressId: activeEmailAddress.id,
          id: draftEmailId,
        })
      } catch (error) {
        setError(error as Error, 'Failed to fetch a draft email message')
        throw error
      } finally {
        setDraftsLoading(false)
      }
    },
    [
      activeEmailAddress,
      clearError,
      setError,
      setDraftsLoading,
      sudoEmailClient,
    ],
  )

  // Load data when the hook is used
  useCallback(() => {
    void listScheduledMessagesHandler()
    void listDraftEmailMessagesHandler()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Email address has changed, clear scheduled and draft messages
  // and reload
  useActiveEmailAddressUpdate((emailAddress) => {
    setScheduledMessages([])
    void listScheduledMessagesHandler()
    setDraftMessagesMetadataList([])
    void listDraftEmailMessagesHandler()
  })

  return {
    draftMessagesMetadataList,
    setDraftMessagesMetadataList,
    draftsLoading,
    listDraftEmailMessagesHandler,
    createDraftEmailMessageHandler,
    deleteDraftEmailMessagesHandler,
    getDraftEmailMessageHandler,
    scheduledMessages,
    setScheduledMessages,
    scheduledMessagesLoading,
    scheduleSendMessagesHandler,
    cancelScheduledMessageHandler,
    listScheduledMessagesHandler,
  }
}
