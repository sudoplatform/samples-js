import { useCallback, useContext, useState } from 'react'
import { EmailAlias } from '@sudoplatform/sudo-email'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { useActiveSudoUpdate } from './useActiveSudoUpdate'

/**
 * Hook to retrieve a list of all email alias belonging to the owner
 *
 * Email alias addresses are retrieved when `sudoEmailClient` and `activeSudo` are initialized,
 * but can also be refreshed via the `listEmailAliasHandler` callback.
 */
export const useEmailAliases = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const [emailAliases, setEmailAliases] = useState<EmailAlias[]>([])

  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const listEmailAliasesHandler = useCallback(async () => {
    clearError()
    setLoading(true)

    try {
      const { items } = await sudoEmailClient.listEmailAliasesForOwner()
      setEmailAliases(items)

      return items
    } catch (error) {
      setError(error as Error, 'Failed to retrieve email aliases')
    } finally {
      setLoading(false)
    }
  }, [sudoEmailClient, setError, clearError, setLoading])

  // Load aliases on active Sudo change (same pattern as useEmailAddresses).
  useActiveSudoUpdate(() => {
    void listEmailAliasesHandler()
  })

  return {
    emailAliasesLoading: loading,
    emailAliasesError: error,
    emailAliases,
    listEmailAliasesHandler,
  }
}
