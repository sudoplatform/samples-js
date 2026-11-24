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
import { emailKeyManager, profilesKeyManager } from '@services/deviceKeys'
import { clearSudoKeys, ensureSudoKeys } from '@services/sudoKeyStore'
import {
  clearLastSignedInUser,
  getEnforceSingletonPublicKey,
  getLastSignedInUser,
  getUsedFederatedSignIn,
  setLastSignedInUser,
} from '@services/session'
import { message } from 'antd'
import { ListOperationResultStatus } from '@sudoplatform/sudo-common'

/** Clears the user's keys and cached data, leaving the sign in itself alone. */
const removeUserData = async (
  profilesClient: SudoProfilesClient,
  emailClient: SudoEmailClient,
): Promise<void> => {
  await profilesClient.reset()
  // Removes every key in the email key namespace whatever the key mode, including the singleton key pair,
  // which is created again at the next sign in.
  await emailClient.reset()
  clearSudoKeys()
  clearLastSignedInUser()
}

/** True if the user has any email address or email alias, provisioned in this browser or elsewhere. */
const hasEmailAddressesOrAliases = async (
  emailClient: SudoEmailClient,
): Promise<boolean> => {
  const [addresses, aliases] = await Promise.all([
    emailClient.listEmailAddresses({ limit: 1 }),
    emailClient.listEmailAliases({ limit: 1 }),
  ])
  if (addresses.status === ListOperationResultStatus.Failure) {
    throw addresses.cause
  }
  // Addresses this browser can't unseal, as when it lacks their key, come back in `failed`.
  const hasAddresses =
    addresses.items.length > 0 ||
    (addresses.status === ListOperationResultStatus.Partial &&
      addresses.failed.length > 0)
  return hasAddresses || aliases.items.length > 0
}

/**
 * Creates the key pair every email address and alias shares, if this browser doesn't have it. Single key
 * mode needs it before provisioning. A new key pair means the user's existing addresses and aliases, if
 * any, were registered with a key this browser lacks, so the user is told how to get it back.
 */
const ensureSingletonKeys = async (
  emailClient: SudoEmailClient,
): Promise<void> => {
  const { keyPair } = await emailClient.createSingletonKeysIfAbsent()
  if (!keyPair.created) return
  let hasExisting = false
  try {
    hasExisting = await hasEmailAddressesOrAliases(emailClient)
  } catch (error) {
    // Only the advice depends on this, so the sign in carries on.
    console.error('Failed to check for existing email addresses', error)
  }
  if (!hasExisting) return
  void message.warning(
    getUsedFederatedSignIn()
      ? "This browser doesn't have the key your email addresses and aliases were registered with. Import your key backup on the Import/Export Keys page to read their messages."
      : "This browser doesn't have the key your email addresses and aliases were registered with, so their messages can't be read.",
    10,
  )
}

/**
 * Hook to initialize and return all Sudo clients used in application.
 *
 * Creates the clients for the signed in user and gets them ready: redeems entitlements, removes a previous
 * user's keys, and gives the SDKs their keys.
 */
export const useSudoClients = (sudoUserClient: SudoUserClient) => {
  const [emailClient, setEmailClient] = useState<SudoEmailClient>()
  const [entitlementsClient, setEntitlementsClient] =
    useState<SudoEntitlementsClient>()
  const [profilesClient, setProfilesClient] = useState<SudoProfilesClient>()
  const [enforceSingletonPublicKey, setEnforceSingletonPublicKeyState] =
    useState(false)
  const [loading, setLoading] = useState(true)
  const { error, setError, clearError } = useErrorBoundary()

  const initClients = useCallback(async () => {
    clearError()
    setLoading(true)
    try {
      const entitlementsClient = new DefaultSudoEntitlementsClient(
        sudoUserClient,
      )
      await entitlementsClient.redeemEntitlements()

      const profilesClient = new DefaultSudoProfilesClient({
        sudoUserClient,
        keyManager: profilesKeyManager,
      })
      const enforceSingletonPublicKey = getEnforceSingletonPublicKey()
      const emailClient = new DefaultSudoEmailClient({
        sudoUserClient,
        sudoKeyManager: emailKeyManager,
        sudoEmailClientConfig: {
          enforceSingletonPublicKey,
          // The sample never supplies its own key pairs, so the SDK manages them and removes an email
          // address's key pair when it is deprovisioned.
          allowCallerManagedKeys: false,
        },
      })

      // If a different user signs in after a plain sign out, the previous user's keys and data are removed
      // first, so the new user neither sees them nor encrypts with them.
      const userName = await sudoUserClient.getUserName()
      const lastUserName = getLastSignedInUser()
      if (lastUserName && userName && lastUserName !== userName) {
        await removeUserData(profilesClient, emailClient)
      }
      if (userName) setLastSignedInUser(userName)

      await ensureSudoKeys(profilesKeyManager)
      if (enforceSingletonPublicKey) {
        await ensureSingletonKeys(emailClient)
      }

      setEntitlementsClient(entitlementsClient)
      setProfilesClient(profilesClient)
      setEmailClient(emailClient)
      setEnforceSingletonPublicKeyState(enforceSingletonPublicKey)
    } catch (error) {
      setError(error as Error, 'Failed to initialise sudo clients', true)
    } finally {
      setLoading(false)
    }
  }, [setError, clearError, sudoUserClient])

  useEffect(() => {
    void initClients()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const removeData = useCallback(async () => {
    if (profilesClient && emailClient) {
      await removeUserData(profilesClient, emailClient)
    }
  }, [profilesClient, emailClient])

  return {
    clientsLoading: loading,
    clientsError: error,
    sudoEmailClient: emailClient,
    sudoEntitlementsClient: entitlementsClient,
    sudoProfilesClient: profilesClient,
    enforceSingletonPublicKey,
    removeUserData: removeData,
  }
}
