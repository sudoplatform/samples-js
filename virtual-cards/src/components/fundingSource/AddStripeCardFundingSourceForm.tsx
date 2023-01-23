import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import {
  CompleteFundingSourceCompletionDataInput,
  FundingSource,
  FundingSourceType,
  ProvisionalFundingSource,
} from '@sudoplatform/sudo-virtual-cards'
import { Button, Form, HSpace, Input, VSpace } from '@sudoplatform/web-ui'
import FormItem from 'antd/lib/form/FormItem'
import React, { useEffect } from 'react'
import { useAsyncFn } from 'react-use'
import { ErrorFeedback } from '../ErrorFeedback'
import {
  CardFundingSourceInputs,
  ProviderSetupData,
} from './FundingSourceManagement'

export interface Props {
  onSetupFundingSource: (
    providerName: string | undefined,
    providerType: FundingSourceType,
  ) => Promise<(ProvisionalFundingSource & ProviderSetupData) | undefined>
  onCancelFundingSourceSetup: (
    provisionalFundingSourceId: string,
  ) => Promise<void>
  onSubmitFundingSource: (
    provisionalFundingSourceId: string,
    completionData: CompleteFundingSourceCompletionDataInput,
  ) => Promise<FundingSource | undefined>
}
let provisionalFundingSource:
  | (ProvisionalFundingSource & ProviderSetupData)
  | undefined = undefined

export const AddStripeCardFundingSourceForm: React.FC<Props> = ({
  onSetupFundingSource,
  onSubmitFundingSource,
}: Props) => {
  const stripe = useStripe()
  const elements = useElements()

  function resetForm() {
    provisionalFundingSource = undefined
  }

  // Initial load of provisional funding source on mount.
  useEffect(() => {
    async function setupFundingSource() {
      if (!provisionalFundingSource) {
        provisionalFundingSource = await onSetupFundingSource(
          'stripe',
          FundingSourceType.CreditCard,
        )
      }
      console.log('using effect (setup funding source)')
    }
    void setupFundingSource()
  }, [onSetupFundingSource])

  const [submitFundingSourceResult, submitFundingSource] = useAsyncFn(
    async (input: CardFundingSourceInputs) => {
      console.log({ stripe, elements }, 'submitting funding source')
      if (!stripe || !elements) {
        return
      }
      const cardElement = elements.getElement('card')
      if (!cardElement) {
        throw new Error('Internal error: CardNumberElement not found')
      }
      const paymentMethod = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          address: {
            line1: input.addressLine1,
            line2: input.addressLine2,
            city: input.city,
            state: input.state,
            postal_code: input.postalCode,
            country: input.country,
          },
        },
      })
      if (!paymentMethod.paymentMethod) {
        throw new Error('Failed to create payment method')
      }
      if (
        !provisionalFundingSource ||
        !provisionalFundingSource.client_secret
      ) {
        throw new Error('Failed to create funding source')
      }
      const setupIntentResult = await stripe.confirmCardSetup(
        provisionalFundingSource?.client_secret,
        {
          payment_method: paymentMethod.paymentMethod.id,
        },
      )
      if (!setupIntentResult.setupIntent) {
        throw new Error('Failed to create setup intent')
      }
      if (!provisionalFundingSource) {
        throw new Error('Failed to create provisional funding source')
      }
      try {
        await onSubmitFundingSource(provisionalFundingSource.id, {
          provider: 'stripe',
          paymentMethod: paymentMethod.paymentMethod.id,
        })
      } finally {
        resetForm()
      }
    },
    [stripe],
  )

  return (
    <VSpace>
      <Form requiredMark={true} onFinish={submitFundingSource}>
        <FormItem name="Card Information">
          <CardElement
            id="card-number-element"
            options={{ hidePostalCode: true }}
          />
        </FormItem>
        <FormItem name="addressLine1" label="Address Line 1">
          <Input />
        </FormItem>
        <FormItem name="addressLine2" label="Address Line 2" required={false}>
          <Input />
        </FormItem>
        <HSpace stretch="all">
          <VSpace>
            <FormItem name="city" label="City">
              <Input />
            </FormItem>
            <FormItem name="state" label="State">
              <Input />
            </FormItem>
          </VSpace>
          <VSpace>
            <FormItem name="postalCode" label="Postal Code">
              <Input />
            </FormItem>
            <FormItem name="country" label="Country">
              <Input />
            </FormItem>
          </VSpace>
        </HSpace>
        <Button
          disabled={!provisionalFundingSource}
          kind="primary"
          loading={
            !provisionalFundingSource || submitFundingSourceResult.loading
          }
          type="submit"
        >
          Submit
        </Button>
        {submitFundingSourceResult.error && (
          <ErrorFeedback
            message="Error while adding funding source"
            error={submitFundingSourceResult.error}
          />
        )}
      </Form>
    </VSpace>
  )
}
