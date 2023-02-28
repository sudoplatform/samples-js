import { useCallback, useEffect, useState } from 'react'
import {
  FetchOption,
  Sudo,
  SudoProfilesClient,
} from '@sudoplatform/sudo-profiles'
import { useErrorBoundary } from '@components/ErrorBoundary'

/**
 * Async hook for retrieving Sudos belonging to current user.
 *
 * Will automatically initialize when `sudoProfilesClient` arg is supplied.
 * Values can be refreshed via the `listSudosHandler` callback.
 */
export const useSudos = (sudoProfilesClient?: SudoProfilesClient) => {
  const [sudos, setSudos] = useState<Sudo[]>([])
  const [activeSudo, setActiveSudo] = useState<Sudo | undefined>()
  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const listSudosHandler = useCallback(async () => {
    clearError()
    setLoading(true)

    try {
      if (sudoProfilesClient) {
        const result: Sudo[] = (
          await sudoProfilesClient.listSudos(FetchOption.RemoteOnly)
        ).sort(({ label: a }, { label: b }) => {
          return a && b ? (a < b ? -1 : 1) : 0
        })

        setSudos(result)

        // Set active Sudo
        if (result.length === 0) {
          setActiveSudo(undefined)
        } else if (
          !activeSudo ||
          sudos.findIndex(({ id }) => id === activeSudo.id) !== -1
        ) {
          setActiveSudo(result[0])
        }
      }
    } catch (error) {
      setError(error as Error, 'Failed to list sudos')
    } finally {
      setLoading(false)
    }
  }, [sudoProfilesClient, clearError, setError, activeSudo, sudos])

  // Retrieve sudos on component mount
  useEffect(() => {
    void listSudosHandler()
  }, [sudoProfilesClient]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    sudosLoading: loading,
    sudosError: error,
    sudos,
    listSudosHandler,
    activeSudo,
    setActiveSudo,
  }
}
