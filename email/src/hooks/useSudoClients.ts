import { useCallback, useEffect, useState } from 'react'
import {
  DefaultSudoEmailClient,
  SudoEmailClient,
} from '@sudoplatform/sudo-email'
import {
  DefaultSudoEntitlementsClient,
  SudoEntitlementsClient,
} from '@sudoplatform/sudo-entitlements'
import {
  DefaultSudoProfilesClient,
  SudoProfilesClient,
} from '@sudoplatform/sudo-profiles'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { useErrorBoundary } from '@components/ErrorBoundary'

/**
 * Hook to initialize and return all Sudo clients used in application.
 *
 * Values will begin initializing on render so clients are available
 * for use without being called.
 */
export const useSudoClients = (sudoUserClient: SudoUserClient) => {
  const [emailClient, setEmailClient] = useState<SudoEmailClient>()
  const [entitlementsClient, setEntitlementsClient] =
    useState<SudoEntitlementsClient>()
  const [profilesClient, setProfilesClient] = useState<SudoProfilesClient>()

  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const initEmailClient = useCallback(
    (sudoUserClient: SudoUserClient): void => {
      const emailClient = new DefaultSudoEmailClient({ sudoUserClient })
      setEmailClient(emailClient)
    },
    [setEmailClient],
  )

  const initEntitlementsClient = useCallback(
    async (sudoUserClient: SudoUserClient): Promise<void> => {
      const entitlementsClient = new DefaultSudoEntitlementsClient(
        sudoUserClient,
      )
      await entitlementsClient.redeemEntitlements()
      setEntitlementsClient(entitlementsClient)
    },
    [setEntitlementsClient],
  )

  const initProfilesClient = useCallback(
    async (sudoUserClient: SudoUserClient): Promise<void> => {
      const profilesClient = new DefaultSudoProfilesClient({ sudoUserClient })
      await profilesClient.pushSymmetricKey(
        '1234',
        '14A9B3C3540142A11E70ACBB1BD8969F',
      )
      setProfilesClient(profilesClient)
    },
    [setProfilesClient],
  )

  const initClients = useCallback(async () => {
    clearError()
    setLoading(true)

    try {
      await Promise.all([
        initEmailClient(sudoUserClient),
        initEntitlementsClient(sudoUserClient),
        initProfilesClient(sudoUserClient),
      ])
    } catch (error) {
      setError(error as Error, 'Failed to initialise sudo clients', true)
    } finally {
      setLoading(false)
    }
  }, [
    initEmailClient,
    initEntitlementsClient,
    initProfilesClient,
    setLoading,
    setError,
    clearError,
    sudoUserClient,
  ])

  useEffect(() => {
    void initClients()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    clientsLoading: loading,
    clientsError: error,
    sudoEmailClient: emailClient,
    sudoEntitlementsClient: entitlementsClient,
    sudoProfilesClient: profilesClient,
  }
}
