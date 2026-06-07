import { ListOperationResultStatus } from '@sudoplatform/sudo-common'
import {
  ListProvisionalCardsResults,
  ProvisioningState,
  VirtualCard,
} from '@sudoplatform/sudo-virtual-cards'
import { Collapse } from 'antd'
import React, { useContext, useEffect } from 'react'
import { useAsyncFn } from 'react-use'
import { AppContext } from '../../../containers/AppContext'
import { AddVirtualCardForm } from './AddVirtualCardForm'
import { getSudoOwnerId } from './GetSudoOwnerId'
import { VirtualCardList } from './VirtualCardList'

interface Props {
  sudoId: string
  expanded: boolean
  title: string
}

const toIdSet = (cards: Array<Pick<VirtualCard, 'id'>>): Set<string> => {
  return new Set(cards.map((card) => card.id))
}

const setDifference = (left: Set<string>, right: Set<string>): string[] => {
  return [...left].filter((id) => !right.has(id))
}

export const VirtualCardForSudo: React.FC<Props> = (props) => {
  const { virtualCardsClient } = useContext(AppContext)

  const [listVirtualCardsResult, listVirtualCards] = useAsyncFn(async () => {
    const allVirtualCards = await virtualCardsClient.listVirtualCards()

    let filtered: VirtualCard[] = []

    if (
      allVirtualCards.status == ListOperationResultStatus.Success ||
      allVirtualCards.status == ListOperationResultStatus.Partial
    ) {
      // Slight segue that demonstrates use of listProvisionalCards. A provisional card is created as
      // a placeholder during the provisioning process. Once it is completed, it contains a link to the
      // VirtualCard. Provisional cards may also be PROVISIONING or FAILED.
      const allProvisionalCards: ListProvisionalCardsResults =
        await virtualCardsClient.listProvisionalCards()
      let allCompletedVirtualCardsFromProvisional: VirtualCard[] = []
      if (
        allProvisionalCards.status === ListOperationResultStatus.Partial ||
        allProvisionalCards.status === ListOperationResultStatus.Success
      ) {
        allCompletedVirtualCardsFromProvisional = allProvisionalCards.items
          .filter(
            (item) =>
              item.provisioningState === ProvisioningState.Completed &&
              item.card,
          )
          .map((item) => item.card as VirtualCard)
      }
      // Validate both lists contain the same set of card IDs.
      const virtualCardIds = toIdSet(allVirtualCards.items)
      const provisionalCardIds = toIdSet(
        allCompletedVirtualCardsFromProvisional,
      )

      const sameIdSet =
        virtualCardIds.size === provisionalCardIds.size &&
        setDifference(virtualCardIds, provisionalCardIds).length === 0

      if (!sameIdSet) {
        console.log('virtual and provisional card ID sets differ', {
          virtualCardIds: [...virtualCardIds].sort(),
          provisionalCardIds: [...provisionalCardIds].sort(),
        })
      }

      filtered = allVirtualCards.items.filter((item) => {
        return getSudoOwnerId(item.owners) == props.sudoId
      })
    }
    return filtered
  })

  useEffect(() => {
    void listVirtualCards()
  }, [listVirtualCards])

  let addVirtualCardCommand
  if (props.sudoId && props.sudoId.trim() !== '') {
    addVirtualCardCommand = (
      <>
        <h4>Add Virtual Card</h4>
        <AddVirtualCardForm
          onVirtualCardProvisioned={() => listVirtualCards()}
          sudoId={props.sudoId}
        />
      </>
    )
  }

  const panelKey = 'management'

  return (
    <Collapse
      defaultActiveKey={props.expanded ? panelKey : ''}
      items={[
        {
          key: panelKey,
          label: props.title,
          children: (
            <>
              <VirtualCardList
                listVirtualCardsResult={listVirtualCardsResult}
                onVirtualCardCancelled={() => listVirtualCards()}
                onVirtualCardUpdated={() => listVirtualCards()}
              />
              {addVirtualCardCommand}
            </>
          ),
        },
      ]}
    />
  )
}
