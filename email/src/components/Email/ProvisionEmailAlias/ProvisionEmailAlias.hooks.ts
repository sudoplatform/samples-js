import { useContext, useState } from 'react'
import { useAsync } from 'react-use'
import {
  EmailAliasContext,
  ProjectContext,
  SudosContext,
} from '@contexts/index'
import { Sudo } from '@sudoplatform/sudo-profiles'
import { Form, message } from 'antd'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { useActiveSudoUpdate } from '@hooks/useActiveSudoUpdate'
import {
  VerifyExternalEmailAddressInput,
  VerifyExternalEmailAddressResult,
} from '@sudoplatform/sudo-email'

const emailAliasAudience = 'sudoplatform.email.email-address'

/**
 * Hook that provides a list of supported email alias domains,
 * based on the `sudoEmailClient` in <ProjectContext>.
 */
export const useSupportedEmailAliasDomains = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { error, setError } = useErrorBoundary()
  const { loading, value } = useAsync(async () => {
    try {
      const emailDomains = await sudoEmailClient.listEmailDomains()
      return emailDomains
        .filter((emailDomain) => emailDomain.isAliasDomain)
        .map((emailDomain) => emailDomain.domain)
    } catch (error) {
      setError(
        error as Error,
        'Failed to retrieve supported email alias domains (reload required)',
        true, // fatal
      )
    }
  })

  return {
    supportedEmailAliasDomainsLoading: loading,
    supportedEmailAliasDomainsError: error,
    supportedEmailAliasDomains: value,
  }
}

export interface EmailAliasAddressInputs {
  internalEmailAddress?: string
  externalEmailAddress?: string
  aliasLocalPart: string
  aliasDomain: string
}

/**
 * Hook providing api retrival, form logic and error
 * handling for <ProvisionEmailAlias> component.
 */
export const useProvisionEmailAliasForm = () => {
  const { sudoEmailClient, sudoProfilesClient } = useContext(ProjectContext)
  const { activeSudo } = useContext(SudosContext)
  const { listEmailAliasesHandler } = useContext(EmailAliasContext)
  const [form] = Form.useForm<EmailAliasAddressInputs>()
  const [loading, setLoading] = useState(false)

  // Use hook for managing error state for <ErrorBoundary>.
  const { error, setError, clearError } = useErrorBoundary()

  // Clear any errors on active Sudo change.
  useActiveSudoUpdate(clearError)

  // Provision new email alias from form input.
  const provisionEmailAliasHandler = async (
    {
      externalEmailAddress,
      internalEmailAddress,
      aliasLocalPart,
      aliasDomain,
    }: EmailAliasAddressInputs,
    { id: sudoId }: Sudo,
  ) => {
    const realAddress = internalEmailAddress ?? externalEmailAddress
    if (!realAddress) {
      throw new Error('An internal/external email address is required')
    }
    const ownershipProofToken = await sudoProfilesClient.getOwnershipProof(
      sudoId as string,
      emailAliasAudience,
    )

    return await sudoEmailClient.provisionEmailAlias({
      realAddress,
      aliasAddress: `${aliasLocalPart}@${aliasDomain}`,
      ownershipProofToken,
    })
  }

  // Verify external address.
  const verifyExternalEmailAddressHandler = async (
    emailAliasId: string,
    emailAddress: string,
    verificationCode?: string,
  ): Promise<VerifyExternalEmailAddressResult | undefined> => {
    const input: VerifyExternalEmailAddressInput = {
      emailAddress,
      emailAliasId,
    }
    if (verificationCode) {
      input.verificationCode = verificationCode
    }
    const result = await sudoEmailClient.verifyExternalEmailAddress(input)
    return verificationCode ? result : undefined
  }

  // Return validated form values (null if not validated).
  const getFormValues = async (): Promise<EmailAliasAddressInputs | null> => {
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

        const { aliasAddress } = await provisionEmailAliasHandler(
          formValues,
          activeSudo,
        )

        setLoading(false)

        void message.success(
          `Successfully provisioned email alias '${aliasAddress}'`,
        )

        // Reset form fields (leave `domain` intact).
        form.resetFields([
          'aliasLocalPart',
          'internalEmailAddress',
          'externalEmailAddress',
        ])

        listEmailAliasesHandler()
      } catch (error) {
        setLoading(false)
        setError(error as Error, 'Failed to provision email alias')

        throw error
      }
    }
  }

  return {
    form,
    formSubmitHandler,
    provisionEmailAliasLoading: loading,
    provisionEmailAliasError: error,
    verifyExternalEmailAddressHandler,
  }
}
