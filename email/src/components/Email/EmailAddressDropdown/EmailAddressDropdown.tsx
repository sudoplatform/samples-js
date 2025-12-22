import React, { useContext } from 'react'
import { EmailContext } from '@contexts/index'
import { Dropdown } from '@components/Dropdown'

export const EmailAddressDropdown = (): React.ReactElement => {
  const {
    activeEmailAddress,
    emailAddresses,
    emailAddressesLoading,
    setActiveEmailAddress,
  } = useContext(EmailContext)

  return (
    <Dropdown
      emptyItemsLabel="No email addresses"
      noItemSelectedLabel="Select email address"
      getPopupContainer={(triggerNode) =>
        triggerNode.parentElement || document.body
      }
      selectedItem={
        activeEmailAddress && {
          label: activeEmailAddress.emailAddress,
          id: activeEmailAddress.id,
          value: activeEmailAddress,
        }
      }
      items={emailAddresses.map((emailAddress) => ({
        label: emailAddress.emailAddress,
        id: emailAddress.id,
        value: emailAddress,
      }))}
      itemsLoading={emailAddressesLoading}
      onChange={(changedItem) =>
        changedItem && setActiveEmailAddress(changedItem.value)
      }
    />
  )
}
