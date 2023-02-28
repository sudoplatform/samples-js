import { useContext, useEffect, useState } from 'react'
import { EmailAddress } from '@sudoplatform/sudo-email'
import { EmailContext } from '@contexts'

/**
 * Hook that will run the `onChangeCallback` function given if
 * the value of `activeEmailAddress` updates.
 */
export const useActiveEmailAddressUpdate = (
  onChangeCallback?: (emailAddress?: EmailAddress) => void,
): void => {
  const { activeEmailAddress } = useContext(EmailContext)
  const [previousEmailAddress, setPreviousEmailAddress] = useState<
    EmailAddress | undefined
  >()

  useEffect(() => {
    if (activeEmailAddress?.id !== previousEmailAddress?.id) {
      setPreviousEmailAddress(activeEmailAddress)
      if (onChangeCallback) {
        onChangeCallback(activeEmailAddress)
      }
    }
  }, [
    activeEmailAddress,
    previousEmailAddress,
    setPreviousEmailAddress,
    onChangeCallback,
  ])
}
