import { useContext, useMemo, useState } from 'react'
import { ProjectContext } from '@contexts'

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

  useMemo(() => {
    setEncrypted(false)

    if (emailAddresses.length === 0) {
      return
    }

    void (async () => {
      let encrypted = false
      try {
        const result = await sudoEmailClient.lookupEmailAddressesPublicInfo({
          emailAddresses,
        })

        // Only set `encrypted` to true if all requested email addresses are found in
        // result array
        if (result.length !== 0 && emailAddresses.length === result.length) {
          const inputEmailAddresses = emailAddresses.sort()
          const resultEmailAddresses = result
            .map(({ emailAddress }) => emailAddress)
            .sort()
          if (
            inputEmailAddresses.every(
              (address, i) => address === resultEmailAddresses[i],
            )
          ) {
            encrypted = true
          }
        }
      } catch (error) {
        encrypted = false
      } finally {
        setEncrypted(encrypted)
      }
    })()
  }, [emailAddresses, sudoEmailClient])

  return { encrypted }
}
