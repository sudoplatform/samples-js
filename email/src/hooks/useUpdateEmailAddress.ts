import { useContext, useState } from 'react'
import { EmailAddress } from '@sudoplatform/sudo-email'
import { ProjectContext } from '@contexts/index'
import { useErrorBoundary } from '@components/ErrorBoundary'

/**
 * Hook for updating the metadata of an email address by passing as an
 * argument to the `updateEmailAddressHandler` callback. Loading and
 * error states are also provided.
 */
export const useUpdateEmailAddress = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { error, setError, clearError } = useErrorBoundary()
  const [loading, setLoading] = useState(false)

  const updateEmailAddressHandler = async (
    emailAddress: EmailAddress,
    displayName: string,
  ): Promise<void> => {
    clearError()
    setLoading(true)

    try {
      await sudoEmailClient.updateEmailAddressMetadata({
        id: emailAddress.id,
        values: { alias: displayName },
      })
    } catch (error) {
      setError(error as Error, 'Failed to update email address metadata')
    } finally {
      setLoading(false)
    }
  }

  return {
    updateEmailAddressLoading: loading,
    updateEmailAddressError: error,
    updateEmailAddressHandler,
  }
}
