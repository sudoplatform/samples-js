import { useContext, useState } from 'react'
import {
  BatchOperationResultStatus,
  BatchOperationPartialResult,
  EmailMessage,
} from '@sudoplatform/sudo-email'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { ProjectContext } from '@contexts'

/**
 * Hook for deleting email messages via the `deleteEmailMessageHandler`
 * callback, which accepts an array of email messages as an argument.
 *
 * Loading & error values are also provided to track the outcome of
 * the call.
 */
export const useDeleteEmailMessages = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const [resultIds, setResultIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const deleteEmailMessagesHandler = async (
    emailMessages: EmailMessage[],
  ): Promise<void> => {
    clearError()
    setLoading(true)

    try {
      // Invoke SDK to delete given messages and set state once complete.
      const deleteMessagesResult = await sudoEmailClient.deleteEmailMessages(
        emailMessages.map(({ id }) => id),
      )

      if (deleteMessagesResult.status === BatchOperationResultStatus.Failure) {
        throw new Error('`deleteEmailMessages` returned status: Failure')
      }

      setResultIds(
        (deleteMessagesResult as BatchOperationPartialResult<string>)
          .successValues,
      )
    } catch (error) {
      setError(error as Error, 'Failed to delete email messages')
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteEmailMessagesLoading: loading,
    deleteEmailMessagesError: error,
    deletedEmailMessageIds: resultIds,
    deleteEmailMessagesHandler,
  }
}
