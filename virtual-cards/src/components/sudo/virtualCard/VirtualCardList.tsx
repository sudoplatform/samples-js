import { CardState } from '@sudoplatform/sudo-virtual-cards'
import useAsyncFn, { AsyncState } from 'react-use/lib/useAsyncFn'
import React, { useContext, useState } from 'react'
import { VirtualCard } from '@sudoplatform/sudo-virtual-cards'
import { AppContext } from '../../../containers/AppContext'
import { Button } from '@sudoplatform/web-ui'
import { UpdateCardModal } from './UpdateCardModal'
import { VirtualCardDetailModal } from './VirtualCardDetailModal'
import { List } from 'antd'
import Cards from 'react-credit-cards'
import type { Focused } from 'react-credit-cards'
import 'react-credit-cards/es/styles-compiled.css'

interface Props {
  listVirtualCardsResult: AsyncState<VirtualCard[]>
  onVirtualCardCancelled?: (id: string) => void
  onVirtualCardUpdated?: (id: string) => void
}

export const VirtualCardList: React.FC<Props> = (props) => {
  const { virtualCardsClient } = useContext(AppContext)

  const [cancelVirtualCardResult, cancelVirtualCard] = useAsyncFn(
    async (virtualCard: VirtualCard) => {
      console.log({ virtualCard })
      const result = await virtualCardsClient.cancelVirtualCard({
        id: virtualCard.id,
      })
      props.onVirtualCardCancelled?.(result.result.id)
      return result
    },
  )

  const [chosenCard, setChosenCard] = useState<VirtualCard | undefined>(
    undefined,
  )
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(
    undefined,
  )

  const [cvcVisible, setCvcVisible] = useState('name' as Focused)

  const showUpdateModal = (virtualCard: VirtualCard) => {
    setChosenCard(virtualCard)
    setModalVisible(true)
  }
  const toggleCVCVisible = () => {
    setCvcVisible(cvcVisible != 'cvc' ? 'cvc' : 'name')
  }

  return (
    <>
      <List
        dataSource={props.listVirtualCardsResult.value}
        loading={props.listVirtualCardsResult.loading}
        renderItem={(item) => {
          return (
            <List.Item key={item.id}>
              <>
                <div onClick={() => toggleCVCVisible()}>
                  {/* @ts-expect-error  react-credit-cards usage error*/}
                  <Cards
                    cvc={item.csc}
                    expiry={`${item.expiry.mm.padStart(2, '0')}/${
                      item.expiry.yyyy
                    }`}
                    name={item.cardHolder}
                    number={item.pan}
                    focused={cvcVisible}
                  />
                </div>
                {item.state === CardState.Issued ? (
                  <div>
                    <div>
                      <Button
                        disabled={cancelVirtualCardResult.loading}
                        loading={cancelVirtualCardResult.loading}
                        onClick={() => showUpdateModal(item)}
                      >
                        Update
                      </Button>
                      <span style={{ marginLeft: '8px' }} />
                      <Button
                        danger={true}
                        disabled={cancelVirtualCardResult.loading}
                        loading={cancelVirtualCardResult.loading}
                        onClick={() => cancelVirtualCard(item)}
                      >
                        Cancel
                      </Button>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                      <Button
                        kind="primary"
                        onClick={() => {
                          setSelectedCardId(item.id)
                          setDetailModalVisible(true)
                        }}
                      >
                        Full Virtual Card
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div>This card is {item.state}.</div>
                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                      <Button
                        kind="primary"
                        onClick={() => {
                          setSelectedCardId(item.id)
                          setDetailModalVisible(true)
                        }}
                      >
                        Full Virtual Card
                      </Button>
                    </div>
                  </div>
                )}
              </>
            </List.Item>
          )
        }}
      ></List>
      {modalVisible && (
        <UpdateCardModal
          chosenCard={chosenCard}
          open={modalVisible}
          setVisible={setModalVisible}
          onCardUpdated={(id) => props.onVirtualCardUpdated?.(id)}
        />
      )}
      <VirtualCardDetailModal
        virtualCardId={selectedCardId}
        open={detailModalVisible}
        setVisible={setDetailModalVisible}
      />
    </>
  )
}
