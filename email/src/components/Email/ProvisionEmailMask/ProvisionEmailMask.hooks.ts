import { useContext, useState } from 'react'
import { useAsync } from 'react-use'
import { EmailMaskContext, ProjectContext, SudosContext } from '@contexts/index'
import { Sudo } from '@sudoplatform/sudo-profiles'
import { Form, message } from 'antd'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { useActiveSudoUpdate } from '@hooks/useActiveSudoUpdate'
import {
  VerifyExternalEmailAddressInput,
  VerifyExternalEmailAddressResult,
} from '@sudoplatform/sudo-email'

const emailMaskAudience = 'sudoplatform.email.email-address'

/**
 * Hook that provides a list of supported email mask domains,
 * based on the `sudoEmailClient` in <ProjectContext>.
 */
export const useSupportedEmailMaskDomains = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { error, setError } = useErrorBoundary()
  const { loading, value } = useAsync(async () => {
    try {
      const supportedEmailMaskDomainsResult =
        await sudoEmailClient.getEmailMaskDomains()
      return supportedEmailMaskDomainsResult
    } catch (error) {
      setError(
        error as Error,
        'Failed to retrieve supported email mask domains (reload required)',
        true, // fatal
      )
    }
  })

  return {
    supportedEmailMaskDomainsLoading: loading,
    supportedEmailMaskDomainsError: error,
    supportedEmailMaskDomains: value,
  }
}

export interface EmailMaskAddressInputs {
  internalEmailAddress?: string
  externalEmailAddress?: string
  maskLocalPart: string
  maskDomain: string
}

/**
 * Hook providing api retrival, form logic and error
 * handling for <ProvisionEmailMask> component.
 */
export const useProvisionEmailMaskForm = () => {
  const { sudoEmailClient, sudoProfilesClient } = useContext(ProjectContext)
  const { activeSudo } = useContext(SudosContext)
  const { listEmailMasksHandler } = useContext(EmailMaskContext)
  const [form] = Form.useForm<EmailMaskAddressInputs>()
  const [loading, setLoading] = useState(false)

  // Use hook for managing error state for <ErrorBoundary>.
  const { error, setError, clearError } = useErrorBoundary()

  // Clear any errors on active Sudo change.
  useActiveSudoUpdate(clearError)

  // Provision new email mask from form input.
  const provisionEmailMaskHandler = async (
    {
      externalEmailAddress,
      internalEmailAddress,
      maskLocalPart,
      maskDomain,
    }: EmailMaskAddressInputs,
    { id: sudoId }: Sudo,
  ) => {
    const realAddress = internalEmailAddress ?? externalEmailAddress
    if (!realAddress) {
      throw new Error('An internal/external email address is required')
    }
    const ownershipProofToken = await sudoProfilesClient.getOwnershipProof(
      sudoId as string,
      emailMaskAudience,
    )

    return await sudoEmailClient.provisionEmailMask({
      realAddress,
      maskAddress: `${maskLocalPart}@${maskDomain}`,
      ownershipProofToken,
    })
  }

  // Verify external address.
  const verifyExternalEmailAddressHandler = async (
    emailMaskId: string,
    emailAddress: string,
    verificationCode?: string,
  ): Promise<VerifyExternalEmailAddressResult | undefined> => {
    const input: VerifyExternalEmailAddressInput = { emailAddress, emailMaskId }
    if (verificationCode) {
      input.verificationCode = verificationCode
    }
    const result = await sudoEmailClient.verifyExternalEmailAddress(input)
    return verificationCode ? result : undefined
  }

  // Return validated form values (null if not validated).
  const getFormValues = async (): Promise<EmailMaskAddressInputs | null> => {
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

        const { maskAddress } = await provisionEmailMaskHandler(
          formValues,
          activeSudo,
        )

        setLoading(false)

        void message.success(
          `Successfully provisioned email mask '${maskAddress}'`,
        )

        // Reset form fields (leave `domain` intact).
        form.resetFields([
          'maskLocalPart',
          'internalEmailAddress',
          'externalEmailAddress',
        ])

        listEmailMasksHandler()
      } catch (error) {
        setLoading(false)
        setError(error as Error, 'Failed to provision email mask')

        throw error
      }
    }
  }

  return {
    form,
    formSubmitHandler,
    provisionEmailMaskLoading: loading,
    provisionEmailMaskError: error,
    verifyExternalEmailAddressHandler,
  }
}
