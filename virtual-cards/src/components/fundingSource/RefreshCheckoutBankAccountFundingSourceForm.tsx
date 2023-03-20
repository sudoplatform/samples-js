import {
  BankAccountFundingSource,
  CheckoutBankAccountRefreshFundingSourceInteractionData,
  FundingSource,
  FundingSourceType,
  RefreshFundingSourceCheckoutBankAccountRefreshDataInput,
} from '@sudoplatform/sudo-virtual-cards'
import { Button, Form, HSpace, VSpace } from '@sudoplatform/web-ui'
import { Checkbox, Collapse } from 'antd'
import CollapsePanel from 'antd/lib/collapse/CollapsePanel'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  PlaidLinkError,
  PlaidLinkOnExitMetadata,
  PlaidLinkOnSuccessMetadata,
  PlaidLinkOptions,
  usePlaidLink,
} from 'react-plaid-link'
import { useAsyncFn } from 'react-use'
import { RefreshFundingSourceRefreshDataInput } from '@sudoplatform/sudo-virtual-cards/types/public/sudoVirtualCardsClient'

export interface Props {
  onRefreshFundingSource: (
    fundingSourceId: string,
    refreshData: RefreshFundingSourceRefreshDataInput,
  ) => Promise<FundingSource | undefined>
  refreshInteractionData?: CheckoutBankAccountRefreshFundingSourceInteractionData
  fundingSource: BankAccountFundingSource
}

export const RefreshCheckoutBankAccountFundingSourceForm: React.FC<Props> = ({
  onRefreshFundingSource,
  refreshInteractionData,
  fundingSource,
}: Props) => {
  const refreshInProgress = useRef<boolean>(false)

  const [agreementAccepted, setAgreementAccepted] = useState(false)

  const [linkSuccess, setLinkSuccess] = useState<{
    public_token: string
    metadata: PlaidLinkOnSuccessMetadata
  } | null>(null)
  const [linkError, setLinkError] = useState<{
    err: PlaidLinkError | null
    metadata: PlaidLinkOnExitMetadata
  } | null>(null)

  /* eslint-disable react-hooks/exhaustive-deps */
  const config: PlaidLinkOptions = {
    onEvent: (eventName) => {
      console.log(`Plaid event: ${eventName}`)
    },
    onSuccess: (public_token, metadata) => {
      setLinkSuccess({ public_token, metadata })
    },
    onExit: (err, metadata) => {
      setLinkError({ err, metadata })
    },
    token: refreshInteractionData?.linkToken ?? '',
  }

  const plaid = usePlaidLink(config)

  useEffect(() => {
    config.token = refreshInteractionData?.linkToken ?? null
  }, [config, refreshInteractionData])

  useEffect(() => {
    if (refreshInProgress.current) {
      return
    }

    async function beginRefreshFundingSource() {
      const refreshData: RefreshFundingSourceRefreshDataInput = {
        provider: 'checkout',
        type: FundingSourceType.BankAccount,
      }
      console.log('Beginning to refresh funding source')
      await onRefreshFundingSource(fundingSource.id, refreshData)
    }
    void beginRefreshFundingSource()
  }, [fundingSource, onRefreshFundingSource])

  const resetForm = useCallback(() => {
    setLinkError(null)
    setLinkSuccess(null)
    refreshInProgress.current = false
    setAgreementAccepted(false)
    plaid.exit()
  }, [plaid])

  useEffect(() => {
    async function plaidLinkFailureHandler() {
      if (!linkError) {
        return
      }
      console.error('Plaid link error', linkError)
      resetForm()
    }

    void plaidLinkFailureHandler()
  }, [resetForm, linkError])

  const [, refreshFundingSource] = useAsyncFn(async () => {
    console.log('Checking for success', {
      refreshInProgress,
      linkSuccess,
      provisionalFundingSource: fundingSource,
    })
    if (!linkSuccess) {
      console.log('Waiting for Plaid Link to complete ....')
      return
    }
    if (!agreementAccepted) {
      console.log('Waiting for agreement to be accepted ....')
      return
    }
    if (refreshInProgress.current) {
      console.log('Waiting for funding source set up to complete ...')
      return
    }

    if (!fundingSource || !refreshInteractionData) {
      throw new Error('Funding source not set up')
    }

    refreshInProgress.current = true

    if (!linkSuccess.metadata.institution) {
      console.error('No institution returned on link success')
      throw Error('No institution returned on link success')
    }

    console.log('Plaid link success', linkSuccess)
    const refreshData: RefreshFundingSourceCheckoutBankAccountRefreshDataInput =
      {
        provider: 'checkout',
        type: FundingSourceType.BankAccount,
        accountId: linkSuccess.metadata.accounts[0].id,
        authorizationText: refreshInteractionData.authorizationText[0],
      }

    try {
      await onRefreshFundingSource(fundingSource.id, refreshData)
    } finally {
      resetForm()
    }
  }, [onRefreshFundingSource, linkSuccess, agreementAccepted, resetForm])

  function doPlaidLinkOpen(): void {
    plaid.open()
  }

  let authorizationTextHtml = refreshInteractionData?.authorizationText?.find(
    (a) => a.contentType === 'text/html',
  )?.content
  if (!authorizationTextHtml) {
    const authorizationTextPlain =
      refreshInteractionData?.authorizationText?.find(
        (a) => a.contentType === 'text/plain',
      )?.content
    if (refreshInteractionData && !authorizationTextPlain) {
      throw new Error('No authorization text in refresh data')
    }
    authorizationTextHtml = `<p>${authorizationTextPlain ?? ''}</p>`
  }

  return (
    <VSpace>
      <HSpace>
        <Form>
          <Button
            id={'checkout-bank-account-refresh-launch-plaid'}
            onClick={doPlaidLinkOpen}
            loading={!plaid.ready}
            disabled={!plaid.ready || refreshInProgress.current}
            type="submit"
          >
            Launch Plaid Link to refresh your connection to a bank account
          </Button>
        </Form>
      </HSpace>
      <HSpace>
        <Collapse>
          <CollapsePanel
            collapsible={linkSuccess ? undefined : 'disabled'}
            key={'ach-authorization-agreement'}
            header={'ACH Authorization Agreement'}
          >
            <p>Institution: {linkSuccess?.metadata?.institution?.name}</p>
            <p>Account type: {linkSuccess?.metadata?.accounts[0].subtype}</p>
            <p>Account name: {linkSuccess?.metadata?.accounts[0].name}</p>
            <p>
              Account number ending: ****
              {linkSuccess?.metadata?.accounts[0].mask}
            </p>
            <div dangerouslySetInnerHTML={{ __html: authorizationTextHtml }} />
          </CollapsePanel>
        </Collapse>
      </HSpace>
      <HSpace>
        <Checkbox
          defaultChecked={false}
          disabled={!linkSuccess}
          onChange={(e) => setAgreementAccepted(e.target.checked)}
        />
        By checking this box you agree to the terms of the ACH Authorization
        Agreement above.
      </HSpace>
      <HSpace>
        <Button
          id={'checkout-bank-account-refresh-funding-source'}
          onClick={refreshFundingSource}
          loading={refreshInProgress.current}
          disabled={!agreementAccepted}
        >
          Refresh funding source
        </Button>
      </HSpace>
    </VSpace>
  )
}
