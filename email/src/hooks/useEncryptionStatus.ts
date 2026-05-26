import { useContext, useEffect, useState } from 'react'
import { ProjectContext } from '@contexts/index'

/**
 * Custom hook that returns the encryption status for a list of email addresses
 * provided to the `emailAddresses` argument, using the `lookupEmailAddressesPublicInfo`
 * Sudo Email SDK method.
 *
 * The returned object containing a boolean `encrypted` will update whenever the values
 * provided to the input array change.
 */
export const useEncryptionStatus = (emailAddresses: string[]) => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const [encrypted, setEncrypted] = useState(false)

  useEffect(() => {
    setEncrypted(false)

    if (emailAddresses.length === 0) {
      return
    }

    let cancelled = false

    void (async () => {
      let isEncrypted = false
      try {
        const result = await sudoEmailClient.lookupEmailAddressesPublicInfo({
          emailAddresses,
        })

        // Only set `encrypted` to true if all requested email addresses are found in
        // result array and all have encryption enabled
        if (result.length !== 0 && emailAddresses.length === result.length) {
          const inputEmailAddresses = [...emailAddresses].sort()
          const resultEmailAddresses = result
            .map(({ emailAddress, enableEncryption }) => ({
              emailAddress,
              enableEncryption,
            }))
            .sort((a, b) => a.emailAddress.localeCompare(b.emailAddress))
          if (
            inputEmailAddresses.every(
              (address, i) =>
                address === resultEmailAddresses[i].emailAddress &&
                resultEmailAddresses[i].enableEncryption,
            )
          ) {
            isEncrypted = true
          }
        }
      } catch (error) {
        isEncrypted = false
      } finally {
        if (!cancelled) {
          setEncrypted(isEncrypted)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [emailAddresses, sudoEmailClient])

  return { encrypted }
}
