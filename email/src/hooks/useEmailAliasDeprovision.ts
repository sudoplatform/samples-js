import { useCallback, useContext, useState } from 'react'
import { EmailAlias } from '@sudoplatform/sudo-email'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'

/**
 * Hook to provide email alias deprovision functionality by
 * providing an email alias to `deprovisionEmailAliasHandler`.
 */
export const useEmailAliasDeprovision = () => {
  const { sudoEmailClient } = useContext(ProjectContext)

  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const deprovisionEmailAliasHandler = useCallback(
    async ({ id }: EmailAlias) => {
      clearError()
      setLoading(true)

      try {
        const deprovisionResult = await sudoEmailClient.deprovisionEmailAlias({
          emailAliasId: id,
        })

        if (deprovisionResult.id !== id) {
          throw new Error('Deprovisioned email alias ID incorrect')
        }
      } catch (error) {
        setError(error as Error, 'Failed to deprovision email alias')
      } finally {
        setLoading(false)
      }
    },
    [sudoEmailClient, setError, clearError],
  )

  return {
    deprovisionEmailAliasLoading: loading,
    deprovisionEmailAliasError: error,
    deprovisionEmailAliasHandler,
  }
}
