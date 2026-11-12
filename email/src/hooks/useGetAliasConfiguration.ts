import { useCallback, useContext, useState } from 'react'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'

/**
 * Hook to provide email alias enabling functionality by
 * providing an email alias to `enableEmailAliasHandler`.
 */
export const useGetAliasConfiguration = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()
  const [internalEmailAliasEnabled, setInternalEmailAliasEnabled] = useState<
    boolean | undefined
  >()
  const [externalEmailAliasEnabled, setExternalEmailAliasEnabled] = useState<
    boolean | undefined
  >()

  const aliasesConfigurationDataHandler = useCallback(
    async () => {
      clearError()
      setLoading(true)

      try {
        const { emailAliasesEnabled, externalEmailAliasesEnabled } =
          await sudoEmailClient.getConfigurationData()

        if (
          emailAliasesEnabled === undefined ||
          externalEmailAliasesEnabled === undefined
        ) {
          throw new Error('Missing alias configuration data')
        }

        setInternalEmailAliasEnabled(emailAliasesEnabled)
        setExternalEmailAliasEnabled(externalEmailAliasesEnabled)
      } catch (error) {
        setError(
          error as Error,
          'Failed trying to obtain alias configuration data',
        )
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sudoEmailClient],
  )

  return {
    aliasesConfigurationDataLoading: loading,
    aliasesConfigurationDataError: error,
    internalEmailAliasEnabled,
    externalEmailAliasEnabled,
    aliasesConfigurationDataHandler,
  }
}
