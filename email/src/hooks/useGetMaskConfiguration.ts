import { useCallback, useContext, useState } from 'react'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'

/**
 * Hook to provide email mask enabling functionality by
 * providing an email mask to `enableEmailMaskHandler`.
 */
export const useGetMaskConfiguration = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()
  const [internalEmailMaskEnabled, setInternalEmailMaskEnabled] = useState<
    boolean | undefined
  >()
  const [externalEmailMaskEnabled, setExternalEmailMaskEnabled] = useState<
    boolean | undefined
  >()

  const masksConfigurationDataHandler = useCallback(
    async () => {
      clearError()
      setLoading(true)

      try {
        const { emailMasksEnabled, externalEmailMasksEnabled } =
          await sudoEmailClient.getConfigurationData()

        if (
          emailMasksEnabled === undefined ||
          externalEmailMasksEnabled === undefined
        ) {
          throw new Error('Missing mask configuration data')
        }

        setInternalEmailMaskEnabled(emailMasksEnabled)
        setExternalEmailMaskEnabled(externalEmailMasksEnabled)
      } catch (error) {
        setError(
          error as Error,
          'Failed trying to obtain mask configuration data',
        )
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sudoEmailClient],
  )

  return {
    masksConfigurationDataLoading: loading,
    masksConfigurationDataError: error,
    internalEmailMaskEnabled,
    externalEmailMaskEnabled,
    masksConfigurationDataHandler,
  }
}
