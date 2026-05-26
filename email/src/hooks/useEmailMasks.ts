import { useCallback, useContext, useState } from 'react'
import { EmailMask } from '@sudoplatform/sudo-email'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { useActiveSudoUpdate } from './useActiveSudoUpdate'

/**
 * Hook to retrieve a list of all email mask belonging to the owner
 *
 * Email mask addresses are retrieved when `sudoEmailClient` and `activeSudo` are initialized,
 * but can also be refreshed via the `listEmailMaskHandler` callback.
 */
export const useEmailMasks = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const [emailMasks, setEmailMasks] = useState<EmailMask[]>([])

  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const listEmailMasksHandler = useCallback(async () => {
    clearError()
    setLoading(true)

    try {
      const { items } = await sudoEmailClient.listEmailMasksForOwner()
      setEmailMasks(items)

      return items
    } catch (error) {
      setError(error as Error, 'Failed to retrieve email masks')
    } finally {
      setLoading(false)
    }
  }, [sudoEmailClient, setError, clearError, setLoading])

  // Load masks on active Sudo change (same pattern as useEmailAddresses).
  useActiveSudoUpdate(() => {
    void listEmailMasksHandler()
  })

  return {
    emailMasksLoading: loading,
    emailMasksError: error,
    emailMasks,
    listEmailMasksHandler,
  }
}
