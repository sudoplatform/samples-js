import { useContext } from 'react'
import { ProjectContext } from '@contexts'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { useAsync } from 'react-use'

/**
 * Hook to to provide email address availability via the
 * `emailAddressAvailabilityResult` boolean value.
 */
export const useEmailAddressAvailability = (
  localPart?: string,
  domain?: string,
) => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { error, setError, clearError } = useErrorBoundary()

  const { loading, value } = useAsync(async () => {
    if (localPart && domain) {
      clearError()

      try {
        const availableResult: string[] =
          await sudoEmailClient.checkEmailAddressAvailability({
            localParts: new Set([localPart]),
            domains: new Set([domain]),
          })

        // Clear any standing errors on success
        clearError()

        return availableResult.includes(`${localPart}@${domain}`)
      } catch (error) {
        setError(
          error as Error,
          'Failed to retrieve email address availability',
        )
      }
    }
  }, [sudoEmailClient, localPart, domain])

  return {
    emailAddressAvailabilityLoading: loading,
    emailAddressAvailabilityError: error,
    emailAddressAvailabilityResult: value,
  }
}
