const ENFORCE_SINGLETON_PUBLIC_KEY =
  'sudoEmailExample.enforceSingletonPublicKey'
const LAST_SIGNED_IN_USER = 'sudoEmailExample.lastSignedInUser'
const USED_FEDERATED_SIGN_IN = 'sudoEmailExample.usedFederatedSignIn'

/**
 * Whether every email address shares one key pair, chosen on the sign in page and applied to the email
 * client created at sign in.
 */
export const getEnforceSingletonPublicKey = (): boolean =>
  localStorage.getItem(ENFORCE_SINGLETON_PUBLIC_KEY) === 'true'

export const setEnforceSingletonPublicKey = (enforce: boolean): void => {
  localStorage.setItem(ENFORCE_SINGLETON_PUBLIC_KEY, String(enforce))
}

/** User name of the last user to sign in, used to notice when a different user signs in. */
export const getLastSignedInUser = (): string | undefined =>
  localStorage.getItem(LAST_SIGNED_IN_USER) ?? undefined

export const setLastSignedInUser = (userName: string): void => {
  localStorage.setItem(LAST_SIGNED_IN_USER, userName)
}

export const clearLastSignedInUser = (): void => {
  localStorage.removeItem(LAST_SIGNED_IN_USER)
}

/** True if the user signed in with Federated Single Sign On rather than a TEST registration key. */
export const getUsedFederatedSignIn = (): boolean =>
  localStorage.getItem(USED_FEDERATED_SIGN_IN) === 'true'

export const setUsedFederatedSignIn = (used: boolean): void => {
  localStorage.setItem(USED_FEDERATED_SIGN_IN, String(used))
}
