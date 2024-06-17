import { useCallback, useContext, useEffect, useState } from 'react'
import { EmailContext, ProjectContext } from '../contexts'
import { useErrorBoundary } from '../components/ErrorBoundary'
import {
  BatchOperationResultStatus,
  UnsealedBlockedAddress,
} from '@sudoplatform/sudo-email'

export const useEmailBlocklist = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { activeEmailAddress } = useContext(EmailContext)
  const [blockedAddresses, setBlockedAddresses] = useState<string[]>([])
  const [selected, setSelected] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const listBlockedAddressesHandler = useCallback(async (): Promise<void> => {
    if (!activeEmailAddress) {
      setBlockedAddresses([])
      return
    }

    clearError()
    setLoading(true)

    try {
      const blockedAddressResult =
        await sudoEmailClient.getEmailAddressBlocklist()
      setBlockedAddresses(
        blockedAddressResult.reduce(
          (accum: string[], unsealedAddress: UnsealedBlockedAddress) => {
            if (unsealedAddress.status.type === 'Completed') {
              accum.push(unsealedAddress.address)
            } else {
              // Handle error. Most likely a missing key in which case the addresses could be unblocked by the hashed value
            }
            return accum
          },
          [] as string[],
        ),
      )
    } catch (error) {
      setError(error as Error, 'Failed to retrieve blocked addresses')
    } finally {
      setLoading(false)
    }
  }, [
    setError,
    clearError,
    setLoading,
    setBlockedAddresses,
    activeEmailAddress,
    sudoEmailClient,
  ])

  useEffect(() => {
    void listBlockedAddressesHandler()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const blockEmailAddressesHandler = async (
    addresses: string[],
  ): Promise<void> => {
    clearError()
    setLoading(true)

    try {
      const blockEmailAddressesResult =
        await sudoEmailClient.blockEmailAddresses({
          addressesToBlock: addresses,
        })

      if (
        blockEmailAddressesResult.status === BatchOperationResultStatus.Failure
      ) {
        throw new Error('`blockEmailAddresses` returned status: Failure')
      } else if (
        blockEmailAddressesResult.status === BatchOperationResultStatus.Success
      ) {
        setBlockedAddresses([...blockedAddresses, ...addresses])
      } else {
        setBlockedAddresses([
          ...blockedAddresses,
          ...(blockEmailAddressesResult.successValues ?? []),
        ])
      }
    } catch (error) {
      setError(error as Error, 'Failed to block email addresses')
    } finally {
      setLoading(false)
    }
  }

  const unblockEmailAddressesHandler = async (
    addresses: string[],
  ): Promise<void> => {
    clearError()
    setLoading(true)

    try {
      const unblockEmailAddressesResult =
        await sudoEmailClient.unblockEmailAddresses({
          addresses,
        })

      if (
        unblockEmailAddressesResult.status ===
        BatchOperationResultStatus.Failure
      ) {
        throw new Error('`blockEmailAddresses` returned status: Failure')
      } else if (
        unblockEmailAddressesResult.status ===
        BatchOperationResultStatus.Success
      ) {
        setBlockedAddresses(
          blockedAddresses.filter((address) => !addresses.includes(address)),
        )
      } else {
        const successfullyUnblocked =
          unblockEmailAddressesResult.successValues ?? []
        setBlockedAddresses(
          blockedAddresses.filter(
            (address) => !successfullyUnblocked.includes(address),
          ),
        )
      }
    } catch (error) {
      setError(error as Error, 'Failed to unblock email addresses')
    } finally {
      setLoading(false)
    }
  }

  return {
    blocklistLoading: loading,
    blockEmailAddressesError: error,
    blockedAddresses,
    listBlockedAddressesHandler,
    blockEmailAddressesHandler,
    setBlocklistSelected: setSelected,
    blocklistSelected: selected,
    unblockEmailAddressesHandler,
  }
}
