import React, { useContext } from 'react'
import { Button, Input, Select, Spinner, VSpace } from '@sudoplatform/web-ui'
import { Form, message } from 'antd'
const { Item: FormItem, useForm } = Form
import {
  ProvisionalVirtualCard,
  ProvisioningState,
  VirtualCard,
} from '@sudoplatform/sudo-virtual-cards'
import { useAsync, useAsyncFn } from 'react-use'
import { ErrorFeedback } from '../../ErrorFeedback'
import { AppContext } from '../../../containers/AppContext'
import { CachePolicy } from '@sudoplatform/sudo-common'
import { delay } from '../../../util/delay'

interface VirtualCardInputs {
  cardHolder: string
  alias: string
  sudo: string
  fundingSource: string
}

interface Props {
  onVirtualCardProvisioned?: (virtualCard: VirtualCard) => void
  sudoId: string
}

export const AddVirtualCardForm: React.FC<Props> = ({
  onVirtualCardProvisioned,
  sudoId,
}) => {
  const { virtualCardsClient, profilesClient } = useContext(AppContext)

  const fundingSourcesResult = useAsync(async () => {
    return (
      await virtualCardsClient.listFundingSources({
        cachePolicy: CachePolicy.RemoteOnly,
      })
    ).items
  })

  const [form] = useForm<VirtualCardInputs>()

  const pollForProvisionedCard = async (
    id: string,
    interval = 1000,
    maxNumberOfPolls = 10,
  ): Promise<VirtualCard | ProvisionalVirtualCard | undefined> => {
    let provisional: ProvisionalVirtualCard | undefined
    for (let i = 0; i < maxNumberOfPolls; ++i) {
      provisional = await virtualCardsClient.getProvisionalCard({
        id,
        cachePolicy: CachePolicy.RemoteOnly,
      })
      if (
        provisional?.card &&
        provisional.provisioningState === ProvisioningState.Completed
      ) {
        return provisional.card
      }
      await delay(interval)
    }
    return provisional
  }

  const isProvisionalCard = (
    card: ProvisionalVirtualCard | VirtualCard,
  ): card is ProvisionalVirtualCard => {
    return (card as ProvisionalVirtualCard).provisioningState !== undefined
  }

  const isVirtualCard = (
    card: ProvisionalVirtualCard | VirtualCard,
  ): card is VirtualCard => {
    return (card as VirtualCard).last4 !== undefined
  }

  const [submitVirtualCardResult, submitVirtualCard] = useAsyncFn(
    async (input: VirtualCardInputs) => {
      const ownershipProof = await profilesClient.getOwnershipProof(
        sudoId,
        'sudoplatform.virtual-cards.virtual-card',
      )
      const result = await virtualCardsClient.provisionVirtualCard({
        ownershipProofs: [ownershipProof],
        fundingSourceId: input.fundingSource,
        currency: 'USD',
        cardHolder: input.cardHolder,
        metadata: {
          alias: input.alias,
        },
      })
      if (result.provisioningState === ProvisioningState.Provisioning) {
        void message.success('Virtual Card Provisioning...')
      } else if (result.provisioningState === ProvisioningState.Failed) {
        void message.error('Failed to provision Virtual Card')
        throw new Error('Failed to provision Virtual Card.')
      }
      void pollForProvisionedCard(result.id).then((c) => {
        if (c) {
          if (
            isProvisionalCard(c) &&
            c.provisioningState === ProvisioningState.Completed &&
            c.card
          ) {
            onVirtualCardProvisioned?.(c.card)
          } else if (isVirtualCard(c)) {
            onVirtualCardProvisioned?.(c)
          }
        }
      })
    },
  )

  return (
    <VSpace>
      <Form requiredMark={true} onFinish={submitVirtualCard} form={form}>
        <FormItem name="cardHolder" label="Card Holder">
          <Input />
        </FormItem>
        <FormItem name="alias" label="Alias">
          <Input />
        </FormItem>
        <FormItem name="fundingSource" label="Funding Source">
          {fundingSourcesResult.loading ? (
            <div>
              <Spinner />
              Loading...
            </div>
          ) : fundingSourcesResult.value?.length ? (
            <Select
              placeholder="Please choose a Funding Source..."
              options={fundingSourcesResult.value.map((f) => ({
                key: f.id,
                value: f.id,
                label: `**** ${f.last4}`,
              }))}
            ></Select>
          ) : (
            <div>Please add a funding source</div>
          )}
        </FormItem>
        <Button
          class-name="create-virtual-card"
          kind="primary"
          loading={submitVirtualCardResult.loading}
          type="submit"
        >
          Submit
        </Button>
        {submitVirtualCardResult.error && (
          <ErrorFeedback
            message="Error while provisioning virtual card"
            error={submitVirtualCardResult.error}
          />
        )}
      </Form>
    </VSpace>
  )
}
