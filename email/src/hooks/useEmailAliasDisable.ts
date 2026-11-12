import { useCallback, useContext, useState } from 'react'
import { EmailAlias } from '@sudoplatform/sudo-email'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'

/**
 * Hook to provide email alias disabling functionality by
 * providing an email alias to `disableEmailAliasHandler`.
 */
export const useEmailAliasDisable = () => {
  const { sudoEmailClient } = useContext(ProjectContext)

  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const disableEmailAliasHandler = useCallback(
    async ({ id }: EmailAlias) => {
      clearError()
      setLoading(true)

      try {
        const result = await sudoEmailClient.disableEmailAlias({
          emailAliasId: id,
        })

        if (result.id !== id) {
          throw new Error('Disabling email alias ID incorrect')
        }
      } catch (error) {
        setError(error as Error, 'Failed disabling email alias')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [sudoEmailClient, setError, clearError],
  )

  return {
    disableEmailAliasLoading: loading,
    disableEmailAliasError: error,
    disableEmailAliasHandler,
  }
}
