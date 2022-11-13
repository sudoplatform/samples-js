import { SudoVirtualCardsClient } from '@sudoplatform/sudo-virtual-cards'
import { SudoVirtualCardsSimulatorClient } from '@sudoplatform/sudo-virtual-cards-simulator'
import { SudoEntitlementsClient } from '@sudoplatform/sudo-entitlements'
import { SudoProfilesClient } from '@sudoplatform/sudo-profiles'
import { SudoSecureIdVerificationClient } from '@sudoplatform/sudo-secure-id-verification'
import React from 'react'

interface AppState {
  identityVerificationClient: SudoSecureIdVerificationClient
  entitlementsClient: SudoEntitlementsClient
  profilesClient: SudoProfilesClient
  virtualCardsClient: SudoVirtualCardsClient
  virtualCardsSimulatorClient: SudoVirtualCardsSimulatorClient
}

export const AppContext = React.createContext<AppState>(undefined as never)
