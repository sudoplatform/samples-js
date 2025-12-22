import { useErrorBoundary } from '@components/ErrorBoundary'
import { ListOperationResultStatus } from '@sudoplatform/sudo-common'
import {
  BatchOperationResultStatus,
  EmailMessage,
  SudoEmailClient,
} from '@sudoplatform/sudo-email'
import { useCallback, useEffect, useState } from 'react'

/**
 * Hook to provide a list of email messages belonging to the
 * given `activeEmailAddress`, queried by the selected folder.
 */
export const useEmailMessages = (sudoEmailClient: SudoEmailClient) => {
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([])
  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const [requestParams, setRequestParams] = useState<{
    folderId: string
    nextToken?: string
  } | null>()

  /**
   * Handler function to retrieve email messages attached to
   * the selected email folder.
   *
   * The first call will be without `nextToken`; if the result
   * returns a next token, it will be passed to the `requestParams`
   * state and trigger the next call automatically.
   */
  const listEmailMessagesHandler = useCallback(
    async (folderId: string, nextToken?: string): Promise<void> => {
      clearError()
      setLoading(true)

      try {
        const messagesResult =
          await sudoEmailClient.listEmailMessagesForEmailFolderId({
            folderId,
            limit: 20,
            nextToken,
          })

        if (messagesResult.status !== ListOperationResultStatus.Failure) {
          // Set email messages state with only the result items if this
          // call wasn't made with a next token.
          // If there was a token, add result items to the exsting state.
          setEmailMessages(
            nextToken
              ? [...messagesResult.items, ...emailMessages]
              : messagesResult.items,
          )
          // Set next request params if a nextToken was returned
          // from the result.
          setRequestParams(
            messagesResult.nextToken
              ? {
                  folderId,
                  nextToken: messagesResult.nextToken,
                }
              : undefined,
          )
        } else {
          throw new Error(
            '`listEmailMessagesForEmailFolderId` returned status: Failure',
          )
        }
      } catch (error) {
        setError(error as Error, 'Failed to retrieve email messages')
      } finally {
        setLoading(false)
      }
    },
    [
      setError,
      clearError,
      setLoading,
      sudoEmailClient,
      emailMessages,
      setEmailMessages,
      setRequestParams,
    ],
  )

  // Invokes the list messages handler function each time
  // `requestParams` updates with a non-falsy value.
  useEffect(() => {
    if (requestParams) {
      void listEmailMessagesHandler(
        requestParams.folderId,
        requestParams.nextToken,
      )
    }
  }, [requestParams, listEmailMessagesHandler])

  return {
    emailMessagesLoading: loading,
    emailMessagesError: error,
    emailMessages,
    listEmailMessagesHandler: (folderId: string) =>
      void listEmailMessagesHandler(folderId),
  }
}

/**
 * Hook for setting the `seen` attribute of an array
 * of email messages.
 */
export const useUpdateEmailMessages = (sudoEmailClient: SudoEmailClient) => {
  const [resultIds, setResultIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  // Handler function to update the seen status or folder ID metadata
  // of a given list of email messages.
  const updateEmailMessagesHandler = async ({
    emailMessages,
    seen,
    folderId,
  }: {
    emailMessages: EmailMessage[]
    seen?: boolean
    folderId?: string
  }): Promise<void> => {
    clearError()
    setLoading(true)

    try {
      const updateMessagesResult = await sudoEmailClient.updateEmailMessages({
        ids: emailMessages.map(({ id }) => id),
        values: {
          seen,
          folderId,
        },
      })

      if (updateMessagesResult.status !== BatchOperationResultStatus.Failure) {
        setResultIds(
          updateMessagesResult.successValues?.map((val) => val.id) ?? [],
        )
      } else {
        throw new Error('`updateEmailMessages` returned status: Failure')
      }
    } catch (error) {
      setError(error as Error, 'Failed to update status of email message(s)')
    } finally {
      setLoading(false)
    }
  }

  return {
    updateEmailMessagesLoading: loading,
    updateEmailMessagesError: error,
    updatedEmailMessageIds: resultIds,
    updateEmailMessagesHandler,
  }
}
