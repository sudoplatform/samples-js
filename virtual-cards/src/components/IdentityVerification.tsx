import React, { useContext } from 'react'
import { VerificationMethod } from '@sudoplatform/sudo-secure-id-verification'
import {
  Button,
  Card,
  Form,
  FormItem,
  HSpace,
  Input,
  useForm,
  VSpace,
} from '@sudoplatform/web-ui'
import { useAsyncFn } from 'react-use'
import { ErrorFeedback } from './ErrorFeedback'
import { message } from 'antd'
import { LearnMore } from './LearnMore'
import { AppContext } from '../containers/AppContext'
import { AuthContext } from './AuthContext'

interface Props {
  isVerified: boolean
  onIsVerifiedChanged?: (isVerified: boolean) => void
  onChange?: () => void
}

interface IdentityVerificationFormInputs {
  firstName: string
  lastName: string
  address: string
  city?: string
  state?: string
  postalCode: string
  country: string
  dateOfBirth: string
}

/**
 * Component used to display a card for user input identification verification.
 */
export const IdentityVerification: React.FC<Props> = (props) => {
  const { userClient, authenticationTokens } = useContext(AuthContext)
  const { identityVerificationClient } = useContext(AppContext)
  const [form] = useForm<IdentityVerificationFormInputs>()

  const [submitIdentityVerificationResult, submitIdentityVerification] =
    useAsyncFn(async (identity: IdentityVerificationFormInputs) => {
      console.log({ identity })
      const verified = await identityVerificationClient.verifyIdentity({
        ...identity,
        verificationMethod: VerificationMethod.KnowledgeOfPII,
      })
      if (authenticationTokens) {
        console.log('refreshing auth token')
        await userClient.refreshTokens(authenticationTokens.refreshToken)
      }

      props.onIsVerifiedChanged?.(verified.verified)
      if (verified.verified) {
        props.onChange?.()
        void message.success('Identity verified')
        form.resetFields()
      } else {
        void message.error('Failed to verify')
        throw new Error(`Failed to verify.`)
      }
    })

  return (
    <Card title="Identity Verification">
      <VSpace spacing="large">
        <VSpace>
          <LearnMore
            nameText="Identity Verification"
            helpText="Secure identity verification is required in order to ensure
            legitimate usage of the Sudo Platform virtual cards service.
            Identity verification needs to be performed successfully once for
            each user. The default identity information in this form will verify
            successfully in the sandbox environment."
            helpUrl="https://docs.sudoplatform.com/guides/identity-verification/verifying-an-identity"
          />
        </VSpace>
        <VSpace>
          <h3 id="status">
            Status: {props.isVerified ? 'Verified ✅' : 'Not Verified ❌'}
          </h3>
        </VSpace>
        <VSpace>
          <Form
            requiredMark={true}
            onFinish={submitIdentityVerification}
            form={form}
          >
            <HSpace stretch="all">
              <FormItem
                name="firstName"
                label="First Name"
                initialValue={'John'}
              >
                <Input />
              </FormItem>
              <FormItem
                name="lastName"
                label="Last Name"
                initialValue={'Smith'}
              >
                <Input />
              </FormItem>
            </HSpace>
            <FormItem
              name="address"
              label="Address"
              initialValue={'222333 Peachtree Place'}
            >
              <Input />
            </FormItem>
            <FormItem name="city" label="City" initialValue={'Atlanta'}>
              <Input />
            </FormItem>
            <FormItem name="state" label="State" initialValue={'GA'}>
              <Input />
            </FormItem>
            <FormItem
              name="postalCode"
              label="Postal Code"
              initialValue={'30318'}
            >
              <Input />
            </FormItem>
            <FormItem name="country" label="Country" initialValue={'USA'}>
              <Input />
            </FormItem>
            <FormItem
              name="dateOfBirth"
              label="Date of Birth"
              initialValue={'1975-02-28'}
            >
              <Input type="date" />
            </FormItem>
            <FormItem label={<>&nbsp;</>}>
              <Button
                kind="primary"
                type="submit"
                loading={submitIdentityVerificationResult.loading}
              >
                Submit
              </Button>
              {submitIdentityVerificationResult.error && (
                <ErrorFeedback
                  message="An error occurred verifying the identity."
                  error={submitIdentityVerificationResult.error}
                />
              )}
            </FormItem>
          </Form>
        </VSpace>
      </VSpace>
    </Card>
  )
}
