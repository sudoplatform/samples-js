import React from 'react'
import { SudoEmailClient } from '@sudoplatform/sudo-email'
import { SudoEntitlementsClient } from '@sudoplatform/sudo-entitlements'
import { SudoProfilesClient } from '@sudoplatform/sudo-profiles'
import { SudoUserClient } from '@sudoplatform/sudo-user'

interface ProjectState {
  sudoEmailClient: SudoEmailClient
  sudoEntitlementsClient: SudoEntitlementsClient
  sudoProfilesClient: SudoProfilesClient
  sudoUserClient: SudoUserClient
  /** True if every email address shares one key pair. */
  enforceSingletonPublicKey: boolean
  /** Removes the keys that unseal email messages, and cached data, from this device. */
  removeUserData: () => Promise<void>
}

export const ProjectContext = React.createContext<ProjectState>(
  undefined as never,
)
