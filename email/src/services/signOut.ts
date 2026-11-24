import {
  DefaultConfigurationManager,
  DefaultLogger,
} from '@sudoplatform/sudo-common'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { removeDeviceKeys } from './deviceKeys'
import { getUsedFederatedSignIn, setUsedFederatedSignIn } from './session'

const log = new DefaultLogger('signOut')

/**
 * Checks `sudoplatformconfig.json` has the `federatedSignIn` section Federated Single Sign On needs, with
 * redirect URIs the web SDK can use.
 *
 * @returns Why federated sign in can't be used, or undefined if it can.
 */
export const federatedSignInConfigProblem = (): string | undefined => {
  let config: Record<string, unknown> | undefined
  try {
    config = DefaultConfigurationManager.getInstance().getConfigSet(
      'federatedSignIn',
    ) as unknown as Record<string, unknown> | undefined
  } catch {
    config = undefined
  }
  if (!config) {
    return 'This environment does not support federated sign in. Use TEST registration.'
  }
  // The web SDK sends each value to Cognito unchanged, so a list shared with the mobile apps never matches.
  const lists = ['signInRedirectUri', 'signOutRedirectUri'].filter((name) => {
    const value = config?.[name]
    return typeof value === 'string' && value.includes(',')
  })
  if (lists.length > 0) {
    return `${lists.join(
      ' and ',
    )} in sudoplatformconfig.json must be a single URL, for example ${
      window.location.origin
    }/callback, not a comma separated list. Edit the config and restart the app.`
  }
  return undefined
}

/**
 * Signs out of Federated Single Sign On. This ends the session on this device and then sends the browser to
 * the sign in provider to clear its cookies, so the page is replaced and nothing after this call runs.
 *
 * Local tokens are cleared even if the global sign out fails, for example because the session has expired,
 * otherwise the federated user stays signed in and blocks every other sign in.
 */
export const signOutFederated = async (
  sudoUserClient: SudoUserClient,
): Promise<void> => {
  try {
    await sudoUserClient.globalSignOut()
  } catch (err) {
    log.warn(
      `Global sign out failed, signing out on this device only: ${String(err)}`,
    )
  } finally {
    await sudoUserClient.clearAuthenticationTokens()
  }
  // The sign in state still has to go, otherwise a TEST registration finds the federated user registered.
  await sudoUserClient.reset()
  setUsedFederatedSignIn(false)
  sudoUserClient.presentSignOutUI()
}

/**
 * Signs a TEST registration out on this device. The SDK's `signOut` revokes the refresh token but leaves the
 * tokens in the browser, where the user would still read as signed in, so they are cleared here too. They are
 * cleared even if revoking fails, for example because the session has already expired.
 */
export const signOutTest = async (
  sudoUserClient: SudoUserClient,
): Promise<void> => {
  try {
    await sudoUserClient.signOut()
  } catch (err) {
    log.warn(`Sign out failed, signing out on this device only: ${String(err)}`)
  } finally {
    await sudoUserClient.clearAuthenticationTokens()
  }
}

/**
 * Deregisters a TEST registration, which deletes the user and all of their data from the service, then
 * removes the keys and sign in state from this device. The keys are of no use to a new registration, which
 * is a different user.
 *
 * @param removeUserData Removes the keys and cached data held by the signed in clients. Without it, only the
 *   keys are removed.
 */
export const deregister = async (
  sudoUserClient: SudoUserClient,
  removeUserData: () => Promise<void> = removeDeviceKeys,
): Promise<void> => {
  // Deregistering needs a signed in user, for example after a plain sign out.
  if (!(await sudoUserClient.isSignedIn())) {
    await sudoUserClient.signInWithKey()
  }
  await sudoUserClient.deregister()
  await removeUserData()
  await sudoUserClient.reset()
  setUsedFederatedSignIn(false)
}

/**
 * Signs out the way the user signed in. Federated sign out sends the browser to the sign in provider, so
 * nothing after it runs unless the config has no federatedSignIn section.
 */
export const signOut = async (
  sudoUserClient: SudoUserClient,
): Promise<void> => {
  if (getUsedFederatedSignIn()) {
    await signOutFederated(sudoUserClient)
  } else {
    await signOutTest(sudoUserClient)
  }
}
