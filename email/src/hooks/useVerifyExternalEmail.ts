import { useCallback, useContext, useState } from 'react'
import { ProjectContext } from '@contexts/index'
import {
  VerifyExternalEmailAddressInput,
  VerifyExternalEmailAddressResult,
} from '@sudoplatform/sudo-email'

interface UseVerifyExternalEmailReturn {
  verifyLoading: boolean
  verifyError: Error | null
  initiateVerification: (
    emailAliasId: string,
    emailAddress: string,
  ) => Promise<void>
  completeVerification: (
    emailAliasId: string,
    emailAddress: string,
    code: string,
  ) => Promise<VerifyExternalEmailAddressResult>
}

/**
 * Hook encapsulating the two-step external email verification flow.
 *
 * `initiateVerification` triggers the OTP send (no code provided).
 * `completeVerification` submits the OTP code and returns the result.
 *
 * Both manage `verifyLoading` and `verifyError` state internally.
 */
export const useVerifyExternalEmail = (): UseVerifyExternalEmailReturn => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState<Error | null>(null)

  const initiateVerification = useCallback(
    async (emailAliasId: string, emailAddress: string): Promise<void> => {
      setVerifyError(null)
      setVerifyLoading(true)

      try {
        const input: VerifyExternalEmailAddressInput = {
          emailAddress,
          emailAliasId,
        }
        await sudoEmailClient.verifyExternalEmailAddress(input)
      } catch (error) {
        setVerifyError(error as Error)
        throw error
      } finally {
        setVerifyLoading(false)
      }
    },
    [sudoEmailClient],
  )

  const completeVerification = useCallback(
    async (
      emailAliasId: string,
      emailAddress: string,
      code: string,
    ): Promise<VerifyExternalEmailAddressResult> => {
      setVerifyError(null)
      setVerifyLoading(true)

      try {
        const input: VerifyExternalEmailAddressInput = {
          emailAddress,
          emailAliasId,
          verificationCode: code,
        }
        const result = await sudoEmailClient.verifyExternalEmailAddress(input)
        return result as VerifyExternalEmailAddressResult
      } catch (error) {
        setVerifyError(error as Error)
        throw error
      } finally {
        setVerifyLoading(false)
      }
    },
    [sudoEmailClient],
  )

  return {
    verifyLoading,
    verifyError,
    initiateVerification,
    completeVerification,
  }
}
