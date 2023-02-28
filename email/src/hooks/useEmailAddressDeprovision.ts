import { useCallback, useContext, useEffect, useState } from 'react'
import { EmailAddress } from '@sudoplatform/sudo-email'
import { EmailContext, ProjectContext, SudosContext } from '@contexts'
import { useErrorBoundary } from '@components/ErrorBoundary'

/**
 * Hook to provide email address deprovision functionality by
 * providing an email address to `deprovisionEmailAddressHandler`.
 */
export const useEmailAddressDeprovision = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { activeSudo } = useContext(SudosContext)
  const { activeEmailAddress } = useContext(EmailContext)

  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const deprovisionEmailAddressHandler = useCallback(
    async ({ id }: EmailAddress) => {
      clearError()
      setLoading(true)

      try {
        const deprovisionResult = await sudoEmailClient.deprovisionEmailAddress(
          id,
        )

        if (deprovisionResult.id !== id) {
          throw new Error('Deprovisioned email address ID incorrect')
        }
      } catch (error) {
        setError(error as Error, 'Failed to deprovision email address')
      } finally {
        setLoading(false)
      }
    },
    [sudoEmailClient, setError, clearError],
  )

  // Clear any errors on active sudo or active email update.
  useEffect(() => {
    clearError()
  }, [activeSudo, activeEmailAddress, clearError])

  return {
    deprovisionEmailAddressLoading: loading,
    deprovisionEmailAddressError: error,
    deprovisionEmailAddressHandler,
  }
}
