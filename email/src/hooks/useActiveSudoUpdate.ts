import { useContext, useEffect, useState } from 'react'
import { Sudo } from '@sudoplatform/sudo-profiles'
import { SudosContext } from '@contexts/index'

/**
 * Hook to invoke `onUpdate` callback argument if active sudo updates.
 *
 * This replaces useEffect with `activeSudo` as a dependency; useEffect
 * will trigger on re-render, whereas this will only execute callback on
 * value change.
 */
export const useActiveSudoUpdate = (onUpdate?: () => void): void => {
  const [previousSudo, setPreviousSudo] = useState<Sudo | undefined>()
  const { activeSudo } = useContext(SudosContext)

  useEffect(() => {
    if (activeSudo?.id !== previousSudo?.id) {
      setPreviousSudo(activeSudo)
      if (onUpdate) {
        onUpdate()
      }
    }
  }, [activeSudo, previousSudo, setPreviousSudo, onUpdate])
}
