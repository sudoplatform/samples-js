import { useContext, useState } from 'react'
import { EmailAlias } from '@sudoplatform/sudo-email'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'
import type { Dayjs } from 'dayjs'

/**
 * Hook for updating the metadata of an email alias by passing as an
 * argument to the `updateEmailAliasHandler` callback. Loading and
 * error states are also provided.
 */
export const useUpdateEmailAlias = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { error, setError, clearError } = useErrorBoundary()
  const [loading, setLoading] = useState(false)

  const updateEmailAliasHandler = async (
    { id }: EmailAlias,
    metadata?: string,
    expiresAt?: Dayjs,
  ): Promise<void> => {
    clearError()
    setLoading(true)

    try {
      await sudoEmailClient.updateEmailAlias({
        emailAliasId: id,
        // Following API Alias doc - To ignore: undefined - To delete: null,
        metadata:
          metadata === undefined
            ? undefined
            : metadata === null || metadata.trim() === ''
            ? null
            : (JSON.parse(metadata) as Record<string, any>),
        // Following API Alias doc - To ignore: undefined - To delete: null,
        expiresAt:
          expiresAt === undefined
            ? undefined
            : expiresAt === null
            ? null
            : expiresAt?.toDate(),
      })
    } catch (error) {
      setError(error as Error, 'Failed to update email alias')
    } finally {
      setLoading(false)
    }
  }

  return {
    updateEmailAliasLoading: loading,
    updateEmailAliasError: error,
    updateEmailAliasHandler,
  }
}
