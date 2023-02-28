import { useContext, useEffect, useState } from 'react'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { ProjectContext, SudosContext } from '@contexts'
import { Sudo } from '@sudoplatform/sudo-profiles'

/**
 * Custom hook that provides a handler method for deletion
 * of a Sudo, as well as loading and error states.
 */
export const useSudoDelete = () => {
  const { sudoProfilesClient } = useContext(ProjectContext)
  const { activeSudo, sudos, listSudosHandler } = useContext(SudosContext)
  // Store id of sudo being deleted to track loading progress.
  const [sudoDeleteLoadingId, setSudoDeleteLoadingId] = useState<
    string | undefined
  >()
  const { error, setError, clearError } = useErrorBoundary()

  // Clear error/loading states if global active Sudo updates.
  useEffect(() => {
    clearError()
  }, [activeSudo, clearError])

  // As deleted sudo isn't removed from sudos list until
  // the list updates, clear loading status on update.
  useEffect(() => {
    setSudoDeleteLoadingId(undefined)
  }, [sudos])

  const deleteSudoHandler = async (sudo: Sudo): Promise<void> => {
    clearError()
    setSudoDeleteLoadingId(sudo.id)
    const { id, label } = sudo

    try {
      await sudoProfilesClient.deleteSudo(sudo)

      // Retrieve up to date list of Sudos.
      listSudosHandler()
    } catch (error) {
      setSudoDeleteLoadingId(undefined)
      setError(error as Error, `Failed to delete Sudo '${label as string}'`)
    }
  }

  return {
    sudoDeleteLoadingId,
    sudoDeleteError: error,
    deleteSudoHandler,
  }
}
