import { useCallback, useContext, useState } from 'react'
import { EmailAlias } from '@sudoplatform/sudo-email'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { getEmailConfigurationData } from '@util/getEmailConfigurationData'
import { useActiveSudoUpdate } from './useActiveSudoUpdate'

/**
 * Hook to retrieve a list of all email alias belonging to the owner
 *
 * Email alias addresses are retrieved when `sudoEmailClient` and `activeSudo` are initialized,
 * but can also be refreshed via the `listEmailAliasHandler` callback.
 *
 * Aliases are only requested when the email service has them enabled. When they are disabled,
 * the list is empty, no request is made to list them, and `emailAliasesEnabled` is `false`.
 * `emailAliasesEnabled` is `undefined` until the service configuration has been read.
 */
export const useEmailAliases = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const [emailAliases, setEmailAliases] = useState<EmailAlias[]>([])
  const [emailAliasesEnabled, setEmailAliasesEnabled] = useState<
    boolean | undefined
  >()

  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  // If the configuration cannot be read, treat aliases as unavailable so the rest of the
  // email screens keep working.
  const getAliasesEnabled = useCallback(async (): Promise<boolean> => {
    try {
      const config = await getEmailConfigurationData(sudoEmailClient)
      return config.emailAliasesEnabled === true
    } catch (error) {
      console.warn('Failed to retrieve email alias configuration', error)
      return false
    }
  }, [sudoEmailClient])

  const listEmailAliasesHandler = useCallback(async () => {
    clearError()
    setLoading(true)

    try {
      const aliasesEnabled = await getAliasesEnabled()
      setEmailAliasesEnabled(aliasesEnabled)
      if (!aliasesEnabled) {
        setEmailAliases([])
        return []
      }

      const { items } = await sudoEmailClient.listEmailAliasesForOwner()
      setEmailAliases(items)

      return items
    } catch (error) {
      setError(error as Error, 'Failed to retrieve email aliases')
    } finally {
      setLoading(false)
    }
  }, [sudoEmailClient, getAliasesEnabled, setError, clearError, setLoading])

  // Load aliases on active Sudo change (same pattern as useEmailAddresses).
  useActiveSudoUpdate(() => {
    void listEmailAliasesHandler()
  })

  return {
    emailAliasesLoading: loading,
    emailAliasesError: error,
    emailAliasesEnabled,
    emailAliases,
    listEmailAliasesHandler,
  }
}
