import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import {
  CompleteFundingSourceCompletionDataInput,
  FundingSource,
  FundingSourceState,
  FundingSourceType,
  isStripeCardFundingSourceClientConfiguration,
  isStripeCardProvisionalFundingSourceProvisioningData,
  ProvisionalFundingSource,
} from '@sudoplatform/sudo-virtual-cards'
import { CachePolicy } from '@sudoplatform/sudo-common'
import { Card, Spinner, VSpace } from '@sudoplatform/web-ui'
import { Collapse, message } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { AsyncState } from 'react-use/lib/useAsyncFn'
import { AppContext } from '../../containers/AppContext'
import { ErrorFeedback } from '../ErrorFeedback'
import { LearnMore } from '../LearnMore'
import { AddStripeCardFundingSourceForm } from './AddStripeCardFundingSourceForm'
import { FundingSourceList } from './FundingSourceList'

export interface CardFundingSourceInputs {
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

  const [stripeKey, setStripeKey] = useState(1)

  // Initial load of funding sources on mount.
  useEffect(() => {
    void listFundingSources()
  }, [listFundingSources])

  useEffect(() => {
    if (props.deregisterResult.value === 'complete') {
      stripePromise = null
      stripeProvisionalFundingSource = null
    }
  }, [props.deregisterResult])

  const fundingSourceProvidersConfigPromiseResult = useAsync(async () => {
    // We only want to call stripePromise once so check if exists, if not get all config
    if (stripePromise) {
      return stripePromise
    }
    const clientConfiguration = (
      await virtualCardsClient.getVirtualCardsConfig()
    ).fundingSourceClientConfiguration
    clientConfiguration.forEach((config) => {
      if (isStripeCardFundingSourceClientConfiguration(config)) {
        stripePromise = loadStripe(config.apiKey)
      }
    })
    return stripePromise
  })

  const [, provisionalFundingSource] = useAsyncFn(
    async (
      providerName: string | undefined,
      providerType: FundingSourceType,
    ) => {
      console.log(
        `Setting up ${providerName ?? '<unknown>'} ${
          providerType ?? '<unknown>'
        } funding source`,
      )
      if (
        stripeProvisionalFundingSource &&
        stripeProvisionalFundingSource.provider == providerName &&
        stripeProvisionalFundingSource.type == providerType
      ) {
        return stripeProvisionalFundingSource
      }

      const provisionalFS = await virtualCardsClient.setupFundingSource({
        currency: 'USD',
        type: providerType,
        applicationName: 'webApplication',
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
    },
  )

  const [, completeFundingSource] = useAsyncFn(
    async (
      provisionalFundingSourceId: string,
      completionData: CompleteFundingSourceCompletionDataInput,
    ): Promise<FundingSource | undefined> => {
      console.log('completing funding source')
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
          return fundingSource
        } else {
          void message.error('Failed to add Funding Source')
        }
      } catch (err) {
        console.error('completeFundingSource failed', err)
        const error = err as Error
        void message.error(
          `Failed to add Funding Source - unexpected exception ${error?.message}`,
        )
      }
    },
  )

  const [, cancelFundingSourceSetup] = useAsyncFn(
    async (provisionalFundingSourceId: string): Promise<void> => {
      console.log('cancelling funding source setup')
      // No need to notify the client
      if (provisionalFundingSourceId == stripeProvisionalFundingSource?.id) {
        // force remount of stripe form
        setStripeKey((prev) => prev + 2)
        stripeProvisionalFundingSource = null
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
            onFundingSourceReviewed={() => listFundingSources()}
          />
          <h4>Add Funding Source</h4>
          {fundingSourceProvidersConfigPromiseResult.loading ? (
            <>
              <Spinner />
              Loading...
            </>
          ) : fundingSourceProvidersConfigPromiseResult.value ? (
            <Collapse
              accordion={true}
              defaultActiveKey={'checkout'}
              items={[
                {
                  key: 'stripe',
                  label: 'Add Stripe Funding Source',
                  children: (
                    <Elements
                      stripe={fundingSourceProvidersConfigPromiseResult.value}
                    >
                      <AddStripeCardFundingSourceForm
                        onSetupFundingSource={provisionalFundingSource}
                        onCancelFundingSourceSetup={(paymentMethodId) =>
                          cancelFundingSourceSetup(paymentMethodId)
                        }
                        onSubmitFundingSource={(
                          paymentMethodId,
                          completionData,
                        ) =>
                          completeFundingSource(paymentMethodId, completionData)
                        }
                        key={stripeKey}
                      />
                    </Elements>
                  ),
                },
              ]}
            />
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
