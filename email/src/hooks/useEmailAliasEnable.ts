import { useCallback, useContext, useState } from 'react'
import { EmailAlias } from '@sudoplatform/sudo-email'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'

/**
 * Hook to provide email alias enabling functionality by
 * providing an email alias to `enableEmailAliasHandler`.
 */
export const useEmailAliasEnable = () => {
  const { sudoEmailClient } = useContext(ProjectContext)

  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const enableEmailAliasHandler = useCallback(
    async ({ id }: EmailAlias) => {
      clearError()
      setLoading(true)

      try {
        const result = await sudoEmailClient.enableEmailAlias({
          emailAliasId: id,
        })

        if (result.id !== id) {
          throw new Error('Enabling email alias ID incorrect')
        }
      } catch (error) {
        setError(error as Error, 'Failed enabling email alias')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [sudoEmailClient, setError, clearError],
  )

  return {
    enableEmailAliasLoading: loading,
    enableEmailAliasError: error,
    enableEmailAliasHandler,
  }
}
