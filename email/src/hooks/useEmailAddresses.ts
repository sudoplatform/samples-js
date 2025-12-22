import { useCallback, useContext, useState } from 'react'
import { ProjectContext, SudosContext } from '@contexts/index'
import { ListOperationResultStatus } from '@sudoplatform/sudo-common'
import { EmailAddress } from '@sudoplatform/sudo-email'
import { Sudo } from '@sudoplatform/sudo-profiles'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { useActiveSudoUpdate } from './useActiveSudoUpdate'

/**
 * Hook to retrieve a list of all email addresses belonging to the active Sudo, and
 * manage the state of the active email address, which is updated whenever the emails list
 * or active Sudo changes.
 *
 * Email addresses are retrieved when `sudoEmailClient` and `activeSudo` are initialized,
 * but can also be refreshed via the `listEmailAddressesHandler` callback.
 */
export const useEmailAddresses = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { activeSudo } = useContext(SudosContext)
  const [emailAddresses, setEmailAddresses] = useState<EmailAddress[]>([])
  const [activeEmailAddress, setActiveEmailAddress] = useState<EmailAddress>()

  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const listEmailAddresses = useCallback(
    async (activeSudo: Sudo) => {
      clearError()
      setLoading(true)

      try {
        // The result is cast as `Success` type to access { items } value.
        // A `Partial` or `Failure` status will be thrown as an error.
        const result = await sudoEmailClient.listEmailAddressesForSudoId({
          sudoId: activeSudo.id as string,
        })

        if (
          result.status === ListOperationResultStatus.Failure ||
          result.status === ListOperationResultStatus.Partial
        ) {
          setEmailAddresses([])
          setActiveEmailAddress(undefined)

          throw new Error(
            `Failed to retrieve email addresses for Sudo ${
              activeSudo.label as string
            }`,
          )
        } else {
          const { items } = result
          setEmailAddresses(items)

          if (items.length === 0) {
            setActiveEmailAddress(undefined)
          } else {
            if (
              !activeEmailAddress ||
              !items.find(({ id }) => id === activeEmailAddress.id)
            ) {
              setActiveEmailAddress(items[0])
            }
          }

          return items
        }
      } catch (error) {
        setError(error as Error, 'Failed to retrieve email addresses')
      } finally {
        setLoading(false)
      }
    },
    [
      sudoEmailClient,
      activeEmailAddress,
      setActiveEmailAddress,
      setError,
      clearError,
      setLoading,
    ],
  )

  const listEmailAddressesHandler = useCallback(() => {
    if (activeSudo) {
      void listEmailAddresses(activeSudo)
    }
  }, [listEmailAddresses, activeSudo])

  // Refresh email addresses on active Sudo change.
  useActiveSudoUpdate(listEmailAddressesHandler)

  return {
    emailAddressesLoading: loading,
    emailAddressesError: error,
    emailAddresses,
    listEmailAddressesHandler,
    activeEmailAddress,
    setActiveEmailAddress,
  }
}
