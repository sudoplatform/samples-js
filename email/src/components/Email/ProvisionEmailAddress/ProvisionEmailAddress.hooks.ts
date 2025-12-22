import { useContext, useState } from 'react'
import { useAsync } from 'react-use'
import { EmailContext, ProjectContext, SudosContext } from '@contexts/index'
import { Sudo } from '@sudoplatform/sudo-profiles'
import { Form, message } from 'antd'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { useActiveSudoUpdate } from '@hooks/useActiveSudoUpdate'

const emailAudience = 'sudoplatform.email.email-address'

/**
 * Hook that provides a list of supported email domains,
 * based on the `sudoEmailClient` in <ProjectContext>.
 */
export const useSupportedEmailDomains = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { error, setError } = useErrorBoundary()
  const { loading, value } = useAsync(async () => {
    try {
      const supportedEmailDomainsResult =
        await sudoEmailClient.getSupportedEmailDomains()

      return supportedEmailDomainsResult
    } catch (error) {
      setError(
        error as Error,
        'Failed to retrieve supported email address domains (reload required)',
        true, // fatal
      )
    }
  })

  return {
    supportedEmailDomainsLoading: loading,
    supportedEmailDomainsError: error,
    supportedEmailDomains: value,
  }
}

export interface EmailAddressInputs {
  localPart: string
  domain: string
  displayName?: string
}

/**
 * Hook providing api retrival, form logic and error
 * handling for <ProvisionEmailAddress> component.
 */
export const useProvisionEmailAddressForm = () => {
  const { sudoEmailClient, sudoProfilesClient } = useContext(ProjectContext)
  const { activeSudo } = useContext(SudosContext)
  const { listEmailAddressesHandler } = useContext(EmailContext)
  const [form] = Form.useForm<EmailAddressInputs>()
  const [loading, setLoading] = useState(false)

  // Use hook for managing error state for <ErrorBoundary>.
  const { error, setError, clearError } = useErrorBoundary()

  // Clear any errors on active Sudo change.
  useActiveSudoUpdate(clearError)

  // Provision new email address from form input.
  const provisionEmailAddressHandler = async (
    { localPart, domain, displayName }: EmailAddressInputs,
    { id: sudoId }: Sudo,
  ) => {
    const ownershipProofToken = await sudoProfilesClient.getOwnershipProof(
      sudoId as string,
      emailAudience,
    )

    return await sudoEmailClient.provisionEmailAddress({
      emailAddress: `${localPart}@${domain}`,
      ownershipProofToken,
      alias: displayName,
    })
  }

  // Return validated form values (null if not validated).
  const getFormValues = async (): Promise<EmailAddressInputs | null> => {
    try {
      return await form.validateFields()
    } catch {
      // UI library will handle errors on missing fields.
      return null
    }
  }

  // Handler function to be called by component on form submittion.
  const formSubmitHandler = async (): Promise<void> => {
    clearError()

    const formValues = await getFormValues()
    if (formValues !== null) {
      setLoading(true)

      try {
        if (!activeSudo) {
          throw new Error('No Sudo identity provided')
        }

        const { emailAddress } = await provisionEmailAddressHandler(
          formValues,
          activeSudo,
        )
        setLoading(false)

        void message.success(
          `Successfully provisioned email address '${emailAddress}'`,
        )

        // Reset form fields (leave `domain` intact).
        form.resetFields(['localPart', 'displayName'])

        listEmailAddressesHandler()
      } catch (error) {
        setLoading(false)
        setError(error as Error, 'Failed to provision email address')

        throw error
      }
    }
  }

  return {
    form,
    formSubmitHandler,
    provisionEmailLoading: loading,
    provisionEmailError: error,
  }
}
