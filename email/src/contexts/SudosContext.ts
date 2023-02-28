import React from 'react'
import { Sudo } from '@sudoplatform/sudo-profiles'

/**
 * These Sudo state variables are to allow Sudo identities to be utilized by
 * multiple pages on the <Project> container level.
 */
interface SudosState {
  activeSudo?: Sudo
  setActiveSudo: (sudo?: Sudo) => void
  sudos: Sudo[]
  sudosLoading: boolean
  listSudosHandler: () => void
}

export const SudosContext = React.createContext<SudosState>(undefined as never)
