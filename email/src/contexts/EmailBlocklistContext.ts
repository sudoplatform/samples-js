import React from 'react'

interface EmailBlocklistState {
  blockedAddresses: string[]
  blocklistLoading: boolean
  listBlockedAddressesHandler: () => void
  blocklistSelected: boolean
  setBlocklistSelected: (selected: boolean) => void
}

export const EmailBlocklistContext = React.createContext<EmailBlocklistState>(
  undefined as never,
)
