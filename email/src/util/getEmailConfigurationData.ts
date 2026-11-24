import { ConfigurationData, SudoEmailClient } from '@sudoplatform/sudo-email'

/**
 * Configuration requests already made, keyed by the client that made them.
 *
 * The configuration belongs to the email service rather than to the user, so the same value can be
 * shared by every caller of the same client.
 */
const configurationRequests = new WeakMap<
  SudoEmailClient,
  Promise<ConfigurationData>
>()

/**
 * Retrieves the email service configuration, requesting it from `sudoEmailClient` only the first time.
 *
 * Callers that arrive while the first request is still in flight share it. Failed requests are not
 * kept, so the next call will try again.
 */
export const getEmailConfigurationData = (
  sudoEmailClient: SudoEmailClient,
): Promise<ConfigurationData> => {
  let request = configurationRequests.get(sudoEmailClient)
  if (!request) {
    request = sudoEmailClient.getConfigurationData().catch((error) => {
      configurationRequests.delete(sudoEmailClient)
      throw error
    })
    configurationRequests.set(sudoEmailClient, request)
  }
  return request
}
