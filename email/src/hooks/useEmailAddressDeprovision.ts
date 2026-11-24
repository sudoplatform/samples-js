import { useCallback, useContext, useEffect, useState } from 'react'
import {
  EmailAddress,
  KeyPairRemovalFailedError,
} from '@sudoplatform/sudo-email'
import { EmailContext, ProjectContext, SudosContext } from '@contexts/index'
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
        let deprovisionResult: EmailAddress
        try {
          deprovisionResult = await sudoEmailClient.deprovisionEmailAddress(id)
        } catch (error) {
          // The address was deprovisioned, but its key pair is still in this browser. It does no harm there
          // and is removed with the other keys by Remove Data.
          if (!(error instanceof KeyPairRemovalFailedError)) throw error
          console.warn(
            `Deprovisioned ${error.emailAddress.emailAddress} but couldn't remove key pair(s)`,
            error.keyIds,
          )
          deprovisionResult = error.emailAddress
        }

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
