import { useContext, useState } from 'react'
import {
  BatchOperationResultStatus,
  BatchOperationPartialResult,
  EmailMessage,
} from '@sudoplatform/sudo-email'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { ProjectContext } from '@contexts'

/**
 * Hook for setting the `seen` and `folderId` attributes of an array
 * of email messages.
 */
export const useUpdateEmailMessages = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
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
          (updateMessagesResult as BatchOperationPartialResult<string>)
            .successValues,
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
