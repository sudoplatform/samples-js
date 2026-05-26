import { useCallback, useContext, useState } from 'react'
import { EmailMask } from '@sudoplatform/sudo-email'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'

/**
 * Hook to provide email mask disabling functionality by
 * providing an email mask to `disableEmailMaskHandler`.
 */
export const useEmailMaskDisable = () => {
  const { sudoEmailClient } = useContext(ProjectContext)

  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  const disableEmailMaskHandler = useCallback(
    async ({ id }: EmailMask) => {
      clearError()
      setLoading(true)

      try {
        const result = await sudoEmailClient.disableEmailMask({
          emailMaskId: id,
        })

        if (result.id !== id) {
          throw new Error('Disabling email mask ID incorrect')
        }
      } catch (error) {
        setError(error as Error, 'Failed disabling email mask')
        throw error
      } finally {
        setLoading(false)
      }
    },
    [sudoEmailClient, setError, clearError],
  )

  return {
    disableEmailMaskLoading: loading,
    disableEmailMaskError: error,
    disableEmailMaskHandler,
  }
}
