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
}

export const ProjectContext = React.createContext<ProjectState>(
  undefined as never,
)
