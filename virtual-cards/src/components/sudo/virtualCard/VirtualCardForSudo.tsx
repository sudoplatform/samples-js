import { ListOperationResultStatus } from '@sudoplatform/sudo-common'
import { VirtualCard } from '@sudoplatform/sudo-virtual-cards'
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

export const VirtualCardForSudo: React.FC<Props> = (props) => {
  const { virtualCardsClient } = useContext(AppContext)

  const [listVirtualCardsResult, listVirtualCards] = useAsyncFn(async () => {
    const allVirtualCards = await virtualCardsClient.listVirtualCards()

    let filtered: VirtualCard[] = []

    if (
      allVirtualCards.status == ListOperationResultStatus.Success ||
      allVirtualCards.status == ListOperationResultStatus.Partial
    )
      filtered = allVirtualCards.items.filter((item) => {
        return getSudoOwnerId(item.owners) == props.sudoId
      })
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
