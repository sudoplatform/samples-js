import { useContext, useState } from 'react'
import { EmailMask } from '@sudoplatform/sudo-email'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'
import type { Dayjs } from 'dayjs'

/**
 * Hook for updating the metadata of an email mask by passing as an
 * argument to the `updateEmailMaskHandler` callback. Loading and
 * error states are also provided.
 */
export const useUpdateEmailMask = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { error, setError, clearError } = useErrorBoundary()
  const [loading, setLoading] = useState(false)

  const updateEmailMaskHandler = async (
    { id }: EmailMask,
    metadata?: string,
    expiresAt?: Dayjs,
  ): Promise<void> => {
    clearError()
    setLoading(true)

    try {
      await sudoEmailClient.updateEmailMask({
        emailMaskId: id,
        // Following API Mask doc - To ignore: undefined - To delete: null,
        metadata:
          metadata === undefined
            ? undefined
            : metadata === null || metadata.trim() === ''
            ? null
            : (JSON.parse(metadata) as Record<string, any>),
        // Following API Mask doc - To ignore: undefined - To delete: null,
        expiresAt:
          expiresAt === undefined
            ? undefined
            : expiresAt === null
            ? null
            : expiresAt?.toDate(),
      })
    } catch (error) {
      setError(error as Error, 'Failed to update email mask')
    } finally {
      setLoading(false)
    }
  }

  return {
    updateEmailMaskLoading: loading,
    updateEmailMaskError: error,
    updateEmailMaskHandler,
  }
}
