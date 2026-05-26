import { useCallback, useContext, useState } from 'react'
import { EmailMask } from '@sudoplatform/sudo-email'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'

/**
 * Hook to provide email mask deprovision functionality by
 * providing an email mask to `deprovisionEmailMaskHandler`.
 */
export const useEmailMaskDeprovision = () => {
  const { sudoEmailClient } = useContext(ProjectContext)

  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const deprovisionEmailMaskHandler = useCallback(
    async ({ id }: EmailMask) => {
      clearError()
      setLoading(true)

      try {
        const deprovisionResult = await sudoEmailClient.deprovisionEmailMask({
          emailMaskId: id,
        })

        if (deprovisionResult.id !== id) {
          throw new Error('Deprovisioned email mask ID incorrect')
        }
      } catch (error) {
        setError(error as Error, 'Failed to deprovision email mask')
      } finally {
        setLoading(false)
      }
    },
    [sudoEmailClient, setError, clearError],
  )

  return {
    deprovisionEmailMaskLoading: loading,
    deprovisionEmailMaskError: error,
    deprovisionEmailMaskHandler,
  }
}
