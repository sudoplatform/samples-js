import { useCallback, useContext, useEffect, useState } from 'react'
import {
  CachePolicy,
  ListOperationResultStatus,
} from '@sudoplatform/sudo-common'
import { EmailMessage } from '@sudoplatform/sudo-email'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { ProjectContext } from '@contexts'

/**
 * Hook to provide a list of email messages belonging to the
 * given `activeEmailAddress`, queried by the selected folder.
 */
export const useEmailMessages = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
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
            cachePolicy: CachePolicy.RemoteOnly,
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
    listEmailMessagesHandler,
  }
}
