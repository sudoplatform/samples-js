import { DefaultSudoKeyManager } from '@sudoplatform/sudo-common'
import { WebSudoCryptoProvider } from '@sudoplatform/sudo-web-crypto-provider'
import { clearLastSignedInUser } from './session'
import { clearSudoKeys } from './sudoKeyStore'

/**
 * Namespace the sample stores its email keys under. The sample overrides the SDK's default
 * (`DEFAULT_KEY_NAMESPACE`) to show how. The email SDK only imports a key archive exported under its own
 * namespace, so the sample's email key backups import only into apps that use this namespace.
 */
export const EMAIL_KEY_NAMESPACE = 'sudo-email-example'

/**
 * Holds the keys that unseal email messages for as long as the page is open. The email client is created
 * again at every sign in, and would otherwise create its own key manager and lose the keys at sign out.
 * Like the Sudo keys, they are removed only by Remove Data, deregistering, or a page reload.
 */
export const emailKeyManager = new DefaultSudoKeyManager(
  new WebSudoCryptoProvider(
    EMAIL_KEY_NAMESPACE,
    'com.sudoplatform.appservicename',
  ),
)

/**
 * Namespace of the Sudo Profiles SDK's keys. `ss` is the Sudo Profiles default on Android and iOS and the
 * namespace the key backup format records for Sudo keys.
 */
export const PROFILES_KEY_NAMESPACE = 'ss'

/**
 * Holds the AES keys that encrypt Sudo claims, for as long as the page is open. The Profiles client is given
 * this key manager so the app can store the raw key bytes in it. The SDK's `pushSymmetricKey` only takes a
 * string, so it can't hold the random 32-byte keys the Android and iOS apps create.
 */
export const profilesKeyManager = new DefaultSudoKeyManager(
  new WebSudoCryptoProvider(
    PROFILES_KEY_NAMESPACE,
    'com.sudoplatform.appservicename',
  ),
)

/** Removes the keys that unseal email and encrypt Sudos from this device, for when no client exists. */
export const removeDeviceKeys = async (): Promise<void> => {
  await emailKeyManager.removeAllKeys()
  await profilesKeyManager.removeAllKeys()
  clearSudoKeys()
  clearLastSignedInUser()
}
