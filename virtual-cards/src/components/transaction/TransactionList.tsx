import { Transaction } from '@sudoplatform/sudo-virtual-cards'
import {
  ListOperationResult,
  ListOperationResultStatus,
} from '@sudoplatform/sudo-common'
import { List } from 'antd'
import { Button } from '@sudoplatform/web-ui'
import React, { useState } from 'react'
import { AsyncState } from 'react-use/lib/useAsyncFn'
import { TransactionDetailList } from './TransactionDetailList'
import { TransactionDetailModal } from './TransactionDetailModal'
import { formatCurrencyAmount } from '../../util/formatCurrencyAmount'

interface Props {
  listTransactionsResult: AsyncState<ListOperationResult<Transaction>>
}

export const TransactionList: React.FC<Props> = (props) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | undefined
  >(undefined)

  if (
    props.listTransactionsResult.value?.status ===
      ListOperationResultStatus.Success ||
    props.listTransactionsResult.value?.status ===
      ListOperationResultStatus.Partial
  ) {
    return (
      <>
        <List
          dataSource={props.listTransactionsResult.value.items}
          loadMore={props.listTransactionsResult.loading}
          itemLayout="vertical"
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={
                  <span>
                    {`${item.description} (${item.type})`}{' '}
                    <Button
                      kind="primary"
                      onClick={() => {
                        setSelectedTransactionId(item.id)
                        setModalVisible(true)
                      }}
                    >
                      Full Transaction
                    </Button>
                  </span>
                }
                description={`Billed Amount: ${formatCurrencyAmount(
                  item.billedAmount,
                )} ${item.billedAmount.currency} | ${
                  item.detail
                    ? `Fee: ${formatCurrencyAmount(
                        item.detail[0].markupAmount,
                      )} ${item.billedAmount.currency}`
                    : ''
                } |
              ${item.transactedAt.toUTCString()}`}
              />
              <TransactionDetailList transaction={item} />
            </List.Item>
          )}
        ></List>
        <TransactionDetailModal
          transactionId={selectedTransactionId}
          open={modalVisible}
          setVisible={setModalVisible}
        />
      </>
    )
  } else {
    return (
      <List loadMore={props.listTransactionsResult.loading} dataSource={[]} />
    )
  }
}
