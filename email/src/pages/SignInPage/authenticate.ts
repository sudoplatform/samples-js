import {
  AuthenticationTokens,
  SudoUserClient,
  TESTAuthenticationProvider,
} from '@sudoplatform/sudo-user'

/**
 * Retrieve register key and register key id file contents.
 */
const fetchKeys = async (
  registerKeyUrl: RequestInfo,
  registerKeyIdUrl: RequestInfo,
) => {
  return await Promise.all([
    fetch(registerKeyUrl as string).then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to read register key: ${response.status}`)
      }
      return response.text()
    }),
    fetch(registerKeyIdUrl as string).then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to read register key id: ${response.status}`)
      }
      return response.text()
    }),
  ])
}

export const authenticateWithRegisterKey = async (
  registerKeyUrl: RequestInfo,
  registerKeyIdUrl: RequestInfo,
  sudoUserClient: SudoUserClient,
): Promise<AuthenticationTokens> => {
  // Get register key and register key id from config files.
  const [registerKey, registerKeyId] = await fetchKeys(
    registerKeyUrl,
    registerKeyIdUrl,
  )

  // Register with auth provider.
  await sudoUserClient.registerWithAuthenticationProvider(
    new TESTAuthenticationProvider('system-test', registerKey, registerKeyId),
  )

  // Retrieve auth tokens and register result.
  const authTokens = await sudoUserClient.signInWithKey()
  return authTokens
}
