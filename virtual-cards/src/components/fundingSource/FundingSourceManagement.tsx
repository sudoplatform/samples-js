import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import {
  CheckoutCardProvisionalFundingSourceInteractionData,
  FundingSource,
  FundingSourceRequiresUserInteractionError,
  FundingSourceState,
  FundingSourceType,
  isCheckoutCardFundingSourceClientConfiguration,
  isCheckoutCardProvisionalFundingSourceInteractionData,
  isCheckoutCardProvisionalFundingSourceProvisioningData,
  isStripeCardFundingSourceClientConfiguration,
  isStripeCardProvisionalFundingSourceProvisioningData,
  ProvisionalFundingSource,
} from '@sudoplatform/sudo-virtual-cards'
import { CachePolicy } from '@sudoplatform/sudo-common'
import { Card, Spinner, VSpace } from '@sudoplatform/web-ui'
import { message } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { AsyncState } from 'react-use/lib/useAsyncFn'
import { AppContext } from '../../containers/AppContext'
import { ErrorFeedback } from '../ErrorFeedback'
import { LearnMore } from '../LearnMore'
import { AddStripeCardFundingSourceForm } from './AddStripeCardFundingSourceForm'
import { FundingSourceList } from './FundingSourceList'
import Collapse from 'antd/lib/collapse/Collapse'
import CollapsePanel from 'antd/lib/collapse/CollapsePanel'
import { FundingSourceServiceCompletionData } from '@sudoplatform/sudo-virtual-cards/types/private/domain/entities/fundingSource/fundingSourceService'
import { AddCheckoutCardFundingSourceForm } from './AddCheckoutCardFundingSourceForm'

export interface FundingSourceInputs {
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}
interface Props {
  isVerified: boolean
  deregisterResult: AsyncState<string>
  onIsVerifiedChanged?: (isVerified: boolean) => void
}

let stripePromise: Promise<Stripe | null> | null
let checkoutPublicKey: string | null
let redirectUrl: string | undefined = undefined

let checkoutCardProvisionalFundingSource:
  | (ProvisionalFundingSource & ProviderSetupData)
  | null

let stripeProvisionalFundingSource:
  | (ProvisionalFundingSource & ProviderSetupData)
  | null

export interface ProviderSetupData {
  provider: string
  version: number
  intent?: string
  token?: string
  client_secret?: string
}

/**
 * Component for adding a funding source.
 */
export const FundingSourceManagement: React.FC<Props> = (props) => {
  const { virtualCardsClient } = useContext(AppContext)
  const [listFundingSourcesResult, listFundingSources] = useAsyncFn(
    async () => {
      return await virtualCardsClient.listFundingSources({
        cachePolicy: CachePolicy.RemoteOnly,
      })
    },
  )

  const [checkoutKey, setCheckoutKey] = useState(0)
  const [stripeKey, setStripeKey] = useState(1)
  // Initial load of funding sources on mount.
  useEffect(() => {
    void listFundingSources()
  }, [listFundingSources])

  useEffect(() => {
    if (props.deregisterResult.value === 'complete') {
      stripePromise = null
      checkoutPublicKey = null
      checkoutCardProvisionalFundingSource = null
      stripeProvisionalFundingSource = null
    }
  }, [props.deregisterResult])

  const fundingSourceProvidersConfigPromiseResult = useAsync(async () => {
    // We only want to call stripePromise once so check if exists, if not get all config
    if (stripePromise) {
      return stripePromise
    }
    const clientConfiguration =
      await virtualCardsClient.getFundingSourceClientConfiguration()
    clientConfiguration.forEach((config) => {
      if (isStripeCardFundingSourceClientConfiguration(config)) {
        stripePromise = loadStripe(config.apiKey, {
          apiVersion: '2020-08-27',
        })
      }
      if (isCheckoutCardFundingSourceClientConfiguration(config)) {
        checkoutPublicKey = config.apiKey
      }
    })
    return stripePromise
  })

  const [, provisionalFundingSource] = useAsyncFn(
    async (providerName: string | undefined) => {
      if (
        checkoutCardProvisionalFundingSource &&
        checkoutCardProvisionalFundingSource.provider == providerName
      ) {
        return checkoutCardProvisionalFundingSource
      }
      if (
        stripeProvisionalFundingSource &&
        stripeProvisionalFundingSource.provider == providerName
      ) {
        return stripeProvisionalFundingSource
      }

      const provisionalFS = await virtualCardsClient.setupFundingSource({
        currency: 'USD',
        type: FundingSourceType.CreditCard,
        supportedProviders:
          Array.isArray(providerName) || providerName === undefined
            ? providerName
            : [providerName],
      })

      if (
        isStripeCardProvisionalFundingSourceProvisioningData(
          provisionalFS.provisioningData,
        )
      ) {
        stripeProvisionalFundingSource = {
          ...provisionalFS,
          ...provisionalFS.provisioningData,
          client_secret: provisionalFS.provisioningData.clientSecret,
        }
        return stripeProvisionalFundingSource
      }
      if (
        isCheckoutCardProvisionalFundingSourceProvisioningData(
          provisionalFS.provisioningData,
        )
      ) {
        checkoutCardProvisionalFundingSource = {
          ...provisionalFS,
          ...provisionalFS.provisioningData,
        }
        return checkoutCardProvisionalFundingSource
      }
    },
  )

  const [, handleUserInteractionRequired] = useAsyncFn(
    async (
      userInteractionData: CheckoutCardProvisionalFundingSourceInteractionData,
      provisionalFundingSourceId: string,
    ) => {
      console.log(
        `user interaction required to complete funding source ${provisionalFundingSourceId}`,
      )
      // Handled by the AddCheckoutFundingSourceForm
      redirectUrl = userInteractionData.redirectUrl
    },
  )

  const [, completeFundingSource] = useAsyncFn(
    async (
      provisionalFundingSourceId: string,
      completionData: FundingSourceServiceCompletionData,
    ): Promise<FundingSource | undefined> => {
      console.log('completing funding source')
      redirectUrl = undefined
      try {
        const fundingSource = await virtualCardsClient.completeFundingSource({
          id: provisionalFundingSourceId,
          completionData,
        })
        console.log({ fundingSource }, 'funding source')
        void listFundingSources()
        if (fundingSource.state === FundingSourceState.Active) {
          void message.success('Funding Source Added')
          if (
            provisionalFundingSourceId == stripeProvisionalFundingSource?.id
          ) {
            // force remount of stripe form
            setStripeKey((prev) => prev + 2)
            stripeProvisionalFundingSource = null
          }
          if (
            provisionalFundingSourceId ==
            checkoutCardProvisionalFundingSource?.id
          ) {
            // force remount of checkout form
            setCheckoutKey((prev) => prev + 2)
            checkoutCardProvisionalFundingSource = null
          }
          return fundingSource
        } else {
          void message.error('Failed to add Funding Source')
        }
      } catch (err) {
        const error = err as Error
        const userInteractionError =
          err as FundingSourceRequiresUserInteractionError
        if (userInteractionError && userInteractionError.interactionData) {
          if (
            isCheckoutCardProvisionalFundingSourceInteractionData(
              userInteractionError?.interactionData,
            )
          ) {
            await handleUserInteractionRequired(
              userInteractionError?.interactionData,
              provisionalFundingSourceId,
            )
            void message.warning(
              `Warning: user interaction required to complete Funding Source setup`,
            )
            return
          }
        }
        void message.error(
          `Failed to add Funding Source - unexpected exception ${error?.message}`,
        )
      }
    },
  )

  const [, cancelFundingSourceSetup] = useAsyncFn(
    async (provisionalFundingSourceId: string): Promise<void> => {
      console.log('cancelling funding source setup')
      redirectUrl = undefined
      // No need to notify the client
      if (provisionalFundingSourceId == stripeProvisionalFundingSource?.id) {
        // force remount of stripe form
        setStripeKey((prev) => prev + 2)
        stripeProvisionalFundingSource = null
      }
      if (
        provisionalFundingSourceId == checkoutCardProvisionalFundingSource?.id
      ) {
        // force remount of checkout form
        setCheckoutKey((prev) => prev + 2)
        checkoutCardProvisionalFundingSource = null
      }

      void message.error('Failed to add Funding Source')
    },
  )

  return (
    <Card title="Funding Source Management">
      <VSpace spacing="large">
        <LearnMore
          nameText="Funding Source Management"
          helpText="A Funding source is required to link a real credit or debit card to a
          virtual card. This funding source is used to fund a transaction
          performed on the virtual card."
          helpUrl="https://docs.sudoplatform.com/guides/virtual-cards/manage-funding-sources"
        />
      </VSpace>
      {props.isVerified ? (
        <>
          <FundingSourceList
            listFundingSourcesResult={listFundingSourcesResult}
            onFundingSourceCancelled={() => listFundingSources()}
          />
          <h4>Add Funding Source</h4>
          {fundingSourceProvidersConfigPromiseResult.loading ? (
            <>
              <Spinner />
              Loading...
            </>
          ) : fundingSourceProvidersConfigPromiseResult.value ? (
            <Collapse accordion={true} defaultActiveKey={'checkout'}>
              <CollapsePanel key="stripe" header="Add Stripe Funding Source">
                <Elements
                  stripe={fundingSourceProvidersConfigPromiseResult.value}
                >
                  <AddStripeCardFundingSourceForm
                    onSetupFundingSource={provisionalFundingSource}
                    onCancelFundingSourceSetup={(paymentMethodId) =>
                      cancelFundingSourceSetup(paymentMethodId)
                    }
                    onSubmitFundingSource={(paymentMethodId, completionData) =>
                      completeFundingSource(paymentMethodId, completionData)
                    }
                    key={stripeKey}
                  />
                </Elements>
              </CollapsePanel>
              <CollapsePanel
                key="checkout"
                header="Add Checkout Card Funding Source"
              >
                <AddCheckoutCardFundingSourceForm
                  key={checkoutKey}
                  onSetupFundingSource={provisionalFundingSource}
                  onCancelFundingSourceSetup={(fundingSourceId) =>
                    cancelFundingSourceSetup(fundingSourceId)
                  }
                  clientSecret={checkoutPublicKey ?? 'undefined'}
                  redirectUrl={redirectUrl}
                  onSubmitFundingSource={(fundingSourceId, completionData) =>
                    completeFundingSource(fundingSourceId, completionData)
                  }
                />
              </CollapsePanel>
            </Collapse>
          ) : (
            <ErrorFeedback
              message="An error occurred loading funding source configurations."
              error={
                fundingSourceProvidersConfigPromiseResult.error ??
                new Error('unknown')
              }
            />
          )}
        </>
      ) : (
        <VSpace>❌ Identity is not verified</VSpace>
      )}
    </Card>
  )
}
