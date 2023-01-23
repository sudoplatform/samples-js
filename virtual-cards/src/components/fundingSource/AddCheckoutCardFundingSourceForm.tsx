import {
  CardFrame,
  FrameCardTokenizedEvent,
  Frames,
  FramesBillingAddress,
} from 'frames-react'
import {
  CompleteFundingSourceCheckoutCardCompletionDataInput,
  CompleteFundingSourceCompletionDataInput,
  FundingSource,
  FundingSourceType,
  ProvisionalFundingSource,
} from '@sudoplatform/sudo-virtual-cards'
import { Button, Form, HSpace, Input, VSpace } from '@sudoplatform/web-ui'
import FormItem from 'antd/lib/form/FormItem'
import React, { useEffect, useState } from 'react'

import {
  CardFundingSourceInputs,
  ProviderSetupData,
} from './FundingSourceManagement'
import { useAsyncFn } from 'react-use'

export interface Props {
  clientSecret: string
  redirectUrl?: string
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

export const AddCheckoutCardFundingSourceForm: React.FC<Props> = ({
  clientSecret,
  redirectUrl,
  onSetupFundingSource,
  onCancelFundingSourceSetup,
  onSubmitFundingSource,
}: Props) => {
  const [billingAddress, setBillingAddress] = useState<
    FramesBillingAddress | undefined
  >(undefined)

  const [authenticationInProgress, setAuthenticationInProgress] =
    useState<boolean>()

  const [cardFieldsValid, setCardFieldsValid] = useState<boolean>(false)

  useEffect(() => {
    async function setupFundingSource() {
      if (!provisionalFundingSource) {
        provisionalFundingSource = await onSetupFundingSource(
          'checkout',
          FundingSourceType.CreditCard,
        )
      }
      console.log('Provisional funding source', { provisionalFundingSource })
    }
    void setupFundingSource()
  }, [onSetupFundingSource])

  useEffect(() => {
    async function submit() {
      console.log(billingAddress)
      if (billingAddress) {
        await Frames.submitCard()
      }
    }
    void submit()
  }, [billingAddress])

  const [submitFundingSourceResult, submitFundingSource] = useAsyncFn(
    async (input: CardFundingSourceInputs) => {
      console.log({ input }, 'submitting funding source')
      setAuthenticationInProgress(true)
      setBillingAddress({
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        zip: input.postalCode,
        country: input.country,
      })
    },
  )

  async function failureHandler() {
    if (provisionalFundingSource?.id) {
      await onCancelFundingSourceSetup(provisionalFundingSource.id)
      resetForm()
    }
  }

  function cardValidationChanged() {
    setCardFieldsValid(Frames.isCardValid())
  }
  async function successHandler() {
    await attemptCompleteCallback(undefined)
  }

  async function attemptCompleteCallback(
    tokenizedEvent: FrameCardTokenizedEvent | undefined,
  ) {
    // If we have a token, now we need to embed it in the setup data and send to service
    const completionData: CompleteFundingSourceCheckoutCardCompletionDataInput =
      {
        provider: 'checkout',
        type: FundingSourceType.CreditCard,
        paymentToken: tokenizedEvent?.token ?? '',
      }
    if (!provisionalFundingSource) {
      throw new Error('Funding source not set up')
    }
    const fundingSource = await onSubmitFundingSource(
      provisionalFundingSource.id,
      completionData,
    )
    const fundingSourceCompleted = fundingSource !== undefined
    setAuthenticationInProgress(!fundingSourceCompleted)

    if (fundingSourceCompleted) {
      resetForm()
    }
  }

  function resetForm() {
    setAuthenticationInProgress(false)
    provisionalFundingSource = undefined
  }

  window.document.addEventListener('3dsAuthenticationSuccess', successHandler)
  window.document.addEventListener('3dsAuthenticationFailure', failureHandler)

  return (
    <VSpace>
      <Form requiredMark={true} onFinish={submitFundingSource}>
        <Frames
          config={{
            debug: true,
            publicKey: clientSecret,
            cardholder: { billingAddress: billingAddress },
          }}
          cardTokenized={attemptCompleteCallback}
          cardValidationChanged={cardValidationChanged}
        >
          <FormItem name="cardFrame">
            <CardFrame />
          </FormItem>
          In order to pass AVS checks, pass Test_Y in &apos;Address Line
          1&apos;. See &nbsp;
          <a href="https://www.checkout.com/docs/testing/avs-check-testing">
            Checkout documentation
          </a>
          &nbsp; for more information about valid addresses.
          <FormItem
            name="addressLine1"
            label="Address Line 1"
            initialValue={'Test_Y'}
          >
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
        </Frames>
        <Button
          kind="primary"
          loading={
            submitFundingSourceResult.loading || authenticationInProgress
          }
          type="submit"
          disabled={!cardFieldsValid}
        >
          Submit
        </Button>
      </Form>
      <HSpace stretch="all">
        {redirectUrl != undefined ? (
          <div>
            <VSpace>
              <iframe height="450px" width="100%" src={redirectUrl} />
            </VSpace>
          </div>
        ) : (
          <div></div>
        )}
      </HSpace>
    </VSpace>
  )
}
