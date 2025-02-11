import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import {
  BankAccountFundingSource,
  CheckoutBankAccountProvisionalFundingSourceProvisioningData,
  CheckoutBankAccountRefreshFundingSourceInteractionData,
  CompleteFundingSourceCompletionDataInput,
  FundingSource,
  fundingSourceNeedsRefresh,
  FundingSourceRequiresUserInteractionError,
  FundingSourceState,
  FundingSourceType,
  isCheckoutBankAccountProvisionalFundingSourceProvisioningData,
  isCheckoutBankAccountRefreshFundingSourceInteractionData,
  isStripeCardFundingSourceClientConfiguration,
  isStripeCardProvisionalFundingSourceProvisioningData,
  ProvisionalFundingSource,
  RefreshFundingSourceRefreshDataInput,
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
import { AddCheckoutBankAccountFundingSourceForm } from './AddCheckoutBankAccountFundingSourceForm'
import { RefreshCheckoutBankAccountFundingSourceForm } from './RefreshCheckoutBankAccountFundingSourceForm'

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
let refreshInteractionData: (
  | CheckoutBankAccountRefreshFundingSourceInteractionData
  | undefined
)[] = []
let fundingSourcesNeedingRefresh: FundingSource[] = []

let checkoutBankAccountProvisionalFundingSource:
  | (ProvisionalFundingSource & ProviderSetupData)
  | null

let stripeProvisionalFundingSource:
  | (ProvisionalFundingSource & ProviderSetupData)
  | null

function isBankAccountFundingSource(
  fundingSource: FundingSource,
): fundingSource is BankAccountFundingSource {
  return fundingSource.type === FundingSourceType.BankAccount
}
function formatBankAccountFundingSourceHeader(fundingSource: FundingSource) {
  if (!isBankAccountFundingSource(fundingSource)) {
    return `Refresh funding source unexpected type: ${fundingSource.type}`
  }
  return `Refresh Checkout Bank Account Funding Source: Bank Account: ${
    fundingSource.institutionName
  }; ****${fundingSource.last4 ?? ''} (${fundingSource.bankAccountType})`
}

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
      const allFundingSources = await virtualCardsClient.listFundingSources({
        cachePolicy: CachePolicy.RemoteOnly,
      })
      fundingSourcesNeedingRefresh = allFundingSources.items.filter(
        (fundingSource) => fundingSourceNeedsRefresh(fundingSource),
      )
      refreshInteractionData = Array<
        CheckoutBankAccountRefreshFundingSourceInteractionData | undefined
      >(fundingSourcesNeedingRefresh.length).fill(undefined)
      return allFundingSources
    },
  )

  const [stripeKey, setStripeKey] = useState(1)
  const [checkoutBankAccountKey, setCheckoutBankAccountKey] = useState(2)

  // Initial load of funding sources on mount.
  useEffect(() => {
    void listFundingSources()
  }, [listFundingSources])

  useEffect(() => {
    if (props.deregisterResult.value === 'complete') {
      stripePromise = null
      checkoutBankAccountProvisionalFundingSource = null
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
        stripePromise = loadStripe(config.apiKey, {
          apiVersion: '2020-08-27',
        })
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
        checkoutBankAccountProvisionalFundingSource &&
        checkoutBankAccountProvisionalFundingSource.provider == providerName &&
        checkoutBankAccountProvisionalFundingSource.type == providerType
      ) {
        return checkoutBankAccountProvisionalFundingSource
      }
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
      if (
        isCheckoutBankAccountProvisionalFundingSourceProvisioningData(
          provisionalFS.provisioningData,
        )
      ) {
        checkoutBankAccountProvisionalFundingSource = {
          ...provisionalFS,
          ...provisionalFS.provisioningData,
        }
        return checkoutBankAccountProvisionalFundingSource
      }
    },
  )

  const [, handleCheckoutBankAccountRefreshUserInteractionRequired] =
    useAsyncFn(
      async (
        userInteractionData: CheckoutBankAccountProvisionalFundingSourceProvisioningData,
        fundingSourceId: string,
      ) => {
        console.log(
          `user interaction required to refresh funding source ${fundingSourceId}`,
        )

        // Handled by the refreshCheckoutBankAccountFundingSourceForm
        refreshInteractionData[
          getIndexForRefreshableFundingSource(fundingSourceId)
        ] = userInteractionData
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
          if (
            provisionalFundingSourceId ==
            checkoutBankAccountProvisionalFundingSource?.id
          ) {
            // force remount of checkout form
            setCheckoutBankAccountKey((prev) => prev + 2)
            checkoutBankAccountProvisionalFundingSource = null
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

  const [, refreshFundingSource] = useAsyncFn(
    async (
      fundingSourceId: string,
      refreshData: RefreshFundingSourceRefreshDataInput,
    ): Promise<FundingSource | undefined> => {
      console.log('refreshing funding source')
      try {
        refreshInteractionData[
          getIndexForRefreshableFundingSource(fundingSourceId)
        ] = undefined
        const fundingSource = await virtualCardsClient.refreshFundingSource({
          id: fundingSourceId,
          refreshData,
        })
        console.log({ fundingSource }, 'funding source')
        void listFundingSources()
        if (fundingSource.state === FundingSourceState.Active) {
          void message.success('Funding Source Refreshed')
          return fundingSource
        } else {
          void message.error('Failed to refresh Funding Source')
        }
      } catch (err) {
        console.error('refreshFundingSource failed', err)
        const error = err as Error
        const userInteractionError =
          err as FundingSourceRequiresUserInteractionError
        if (userInteractionError && userInteractionError.interactionData) {
          if (
            isCheckoutBankAccountRefreshFundingSourceInteractionData(
              userInteractionError?.interactionData,
            )
          ) {
            await handleCheckoutBankAccountRefreshUserInteractionRequired(
              userInteractionError?.interactionData,
              fundingSourceId,
            )
            void message.warning(
              `Warning: user interaction required to refresh Funding Source`,
            )
            return
          }
        }
        void message.error(
          `Failed to refresh Funding Source - unexpected exception ${error?.message}`,
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
      if (
        provisionalFundingSourceId ==
        checkoutBankAccountProvisionalFundingSource?.id
      ) {
        // force remount of checkout bank account form
        setCheckoutBankAccountKey((prev) => prev + 2)
        checkoutBankAccountProvisionalFundingSource = null
      }

      void message.error('Failed to add Funding Source')
    },
  )

  function getIndexForRefreshableFundingSource(fundingSourceId: string) {
    const index = fundingSourcesNeedingRefresh.findIndex(
      (fs) => fs.id === fundingSourceId,
    )
    if (index < 0) {
      throw new Error('Unable to refresh funding source')
    }
    return 0
  }

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
            <Collapse accordion={true} defaultActiveKey={'checkout'}>
              <CollapsePanel
                key="stripe"
                id="stripe"
                header="Add Stripe Funding Source"
              >
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
                key="checkoutBankAccount"
                id="checkoutBankAccount"
                header="Add Checkout Bank Account Funding Source"
              >
                <AddCheckoutBankAccountFundingSourceForm
                  key={checkoutBankAccountKey}
                  onSetupFundingSource={provisionalFundingSource}
                  onCancelFundingSourceSetup={(fundingSourceId) =>
                    cancelFundingSourceSetup(fundingSourceId)
                  }
                  onSubmitFundingSource={(fundingSourceId, completionData) =>
                    completeFundingSource(fundingSourceId, completionData)
                  }
                />
              </CollapsePanel>
              <>
                {fundingSourcesNeedingRefresh.map((fs) => {
                  if (isBankAccountFundingSource(fs)) {
                    return (
                      <>
                        <CollapsePanel
                          key={`refreshBankAccount-${fs.id}`}
                          id={`refreshBankAccount-${fs.id}`}
                          header={formatBankAccountFundingSourceHeader(fs)}
                        >
                          <RefreshCheckoutBankAccountFundingSourceForm
                            onRefreshFundingSource={refreshFundingSource}
                            refreshInteractionData={
                              refreshInteractionData[
                                getIndexForRefreshableFundingSource(fs.id)
                              ]
                            }
                            fundingSource={fs}
                          />
                        </CollapsePanel>
                      </>
                    )
                  }
                })}
              </>
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
