import {
  CheckoutBankAccountProvisionalFundingSourceProvisioningData,
  CompleteFundingSourceCheckoutBankAccountCompletionDataInput,
  CompleteFundingSourceCompletionDataInput,
  CreateKeysIfAbsentResult,
  FundingSource,
  FundingSourceType,
  isCheckoutBankAccountProvisionalFundingSourceProvisioningData,
  ProvisionalFundingSource,
} from '@sudoplatform/sudo-virtual-cards'
import { Button, Form, HSpace, VSpace } from '@sudoplatform/web-ui'
import { Checkbox, Collapse } from 'antd'
import CollapsePanel from 'antd/lib/collapse/CollapsePanel'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import {
  usePlaidLink,
  PlaidLinkOptions,
  PlaidLinkError,
  PlaidLinkOnExitMetadata,
  PlaidLinkOnSuccessMetadata,
} from 'react-plaid-link'
import { useAsyncFn } from 'react-use'
import { AppContext } from '../../containers/AppContext'

import { ProviderSetupData } from './FundingSourceManagement'

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

export const AddCheckoutBankAccountFundingSourceForm: React.FC<Props> = ({
  onSetupFundingSource,
  onCancelFundingSourceSetup,
  onSubmitFundingSource,
}: Props) => {
  const { virtualCardsClient } = useContext(AppContext)

  const [completionInProgress, setCompletionInProgress] = useState(false)
  const [isOAuthRedirect, setIsOAuthRedirect] = useState(false)

  const [createKeysResult, setCreateKeysResult] =
    useState<CreateKeysIfAbsentResult | null>(null)
  const [provisioningData, setProvisioningData] =
    useState<CheckoutBankAccountProvisionalFundingSourceProvisioningData | null>(
      null,
    )
  const [agreementAccepted, setAgreementAccepted] = useState(false)

  const [linkSuccess, setLinkSuccess] = useState<{
    public_token: string
    metadata: PlaidLinkOnSuccessMetadata
  } | null>(null)
  const [linkError, setLinkError] = useState<{
    err: PlaidLinkError | null
    metadata: PlaidLinkOnExitMetadata
  } | null>(null)

  useEffect(() => {
    if (completionInProgress) {
      return
    }

    async function createKeysIfAbsent() {
      const result = await virtualCardsClient.createKeysIfAbsent()
      setCreateKeysResult(result)
    }
    void createKeysIfAbsent()
  }, [virtualCardsClient, completionInProgress])

  useEffect(() => {
    if (completionInProgress) {
      return
    }

    async function setupFundingSource() {
      if (!provisionalFundingSource) {
        console.log('Setting up new funding source')
        provisionalFundingSource = await onSetupFundingSource(
          'checkout',
          FundingSourceType.BankAccount,
        )
      }
      if (provisionalFundingSource) {
        const provisioningData = provisionalFundingSource?.provisioningData
        if (
          !provisioningData ||
          !isCheckoutBankAccountProvisionalFundingSourceProvisioningData(
            provisioningData,
          )
        ) {
          console.error({ provisionalFundingSource, provisioningData })
          throw Error('Provisional funding source is wrong type')
        }

        console.log({ provisionalFundingSource, provisioningData })
        setProvisioningData(provisioningData)
      }
    }

    void setupFundingSource()
  }, [onSetupFundingSource, completionInProgress])

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
    token: provisioningData?.linkToken ?? '',
    receivedRedirectUri: isOAuthRedirect ? window.location.href : undefined,
  }

  const plaid = usePlaidLink(config)

  const resetForm = useCallback(() => {
    provisionalFundingSource = undefined
    setProvisioningData(null)
    setLinkError(null)
    setLinkSuccess(null)
    setCreateKeysResult(null)
    setCompletionInProgress(false)
    setAgreementAccepted(false)
    setIsOAuthRedirect(false)
    plaid.exit()
  }, [plaid])

  useEffect(() => {
    async function plaidLinkFailureHandler() {
      if (!linkError) {
        return
      }
      console.error('Plaid link error', linkError)
      if (provisionalFundingSource?.id) {
        await onCancelFundingSourceSetup(provisionalFundingSource.id)
      }
      resetForm()
    }

    void plaidLinkFailureHandler()
  }, [onCancelFundingSourceSetup, resetForm, linkError])

  const [, submitFundingSource] = useAsyncFn(async () => {
    console.log('Checking for success', {
      completionInProgress,
      linkSuccess,
      provisionalFundingSource,
      provisioningData,
      createKeysResult,
    })
    if (!linkSuccess) {
      console.log('Waiting for Plaid Link to complete ....')
      return
    }
    if (!agreementAccepted) {
      console.log('Waiting for agreement to be accepted ....')
      return
    }
    if (completionInProgress) {
      console.log('Waiting for funding source set up to complete ...')
      return
    }

    if (!provisionalFundingSource || !provisioningData) {
      throw new Error('Provisional funding source not set up')
    }
    if (!createKeysResult) {
      throw new Error('Private key not set up')
    }

    setCompletionInProgress(true)

    if (!linkSuccess.metadata.institution) {
      console.error('No institution returned on link success')
      throw Error('No institution returned on link success')
    }

    console.log('Plaid link success', linkSuccess)
    const completionData: CompleteFundingSourceCheckoutBankAccountCompletionDataInput =
      {
        provider: 'checkout',
        type: FundingSourceType.BankAccount,
        publicToken: linkSuccess.public_token,
        institutionId: linkSuccess.metadata.institution?.institution_id,
        accountId: linkSuccess.metadata.accounts[0].id,
        authorizationText: provisioningData.authorizationText[0],
      }

    try {
      await onSubmitFundingSource(provisionalFundingSource.id, completionData)
    } finally {
      resetForm()
    }
  }, [
    onSubmitFundingSource,
    provisioningData,
    createKeysResult,
    linkSuccess,
    agreementAccepted,
    completionInProgress,
    resetForm,
  ])

  function doPlaidLinkOpen(): void {
    plaid.open()
  }

  let authorizationTextHtml = provisioningData?.authorizationText?.find(
    (a) => a.contentType === 'text/html',
  )?.content
  if (!authorizationTextHtml) {
    const authorizationTextPlain = provisioningData?.authorizationText?.find(
      (a) => a.contentType === 'text/plain',
    )?.content
    if (provisioningData && !authorizationTextPlain) {
      throw new Error('No authorization text in provisioning data')
    }
    authorizationTextHtml = `<p>${authorizationTextPlain ?? ''}</p>`
  }

  window.document.addEventListener('OAuthSuccess', (event: Event) => {
    console.log('OAuth succeeded', { event })
    setIsOAuthRedirect(true)
  })

  return (
    <VSpace>
      <HSpace>
        <Form>
          <Button
            id={'checkout-bank-account-launch-plaid'}
            onClick={doPlaidLinkOpen}
            loading={!plaid.ready}
            disabled={!plaid.ready || completionInProgress}
            type="submit"
          >
            Launch Plaid Link to connect a bank account
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
          id={'checkout-bank-account-submit-funding-source'}
          onClick={submitFundingSource}
          loading={completionInProgress}
          disabled={!agreementAccepted}
        >
          Create funding source
        </Button>
      </HSpace>
    </VSpace>
  )
}
