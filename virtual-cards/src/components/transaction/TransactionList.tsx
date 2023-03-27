import { CurrencyAmount, Transaction } from '@sudoplatform/sudo-virtual-cards'
import {
  ListOperationResult,
  ListOperationResultStatus,
} from '@sudoplatform/sudo-common'
import { List } from 'antd'
import React from 'react'
import { AsyncState } from 'react-use/lib/useAsyncFn'

interface Props {
  listTransactionsResult: AsyncState<ListOperationResult<Transaction>>
}

export const TransactionList: React.FC<Props> = (props) => {
  if (
    props.listTransactionsResult.value?.status ===
      ListOperationResultStatus.Success ||
    props.listTransactionsResult.value?.status ===
      ListOperationResultStatus.Partial
  ) {
    return (
      <List
        dataSource={props.listTransactionsResult.value.items}
        loadMore={props.listTransactionsResult.loading}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta
              title={`${item.description} (${item.type})`}
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
          </List.Item>
        )}
      ></List>
    )
  } else {
    return (
      <List loadMore={props.listTransactionsResult.loading} dataSource={[]} />
    )
  }
}

function formatCurrencyAmount(value: CurrencyAmount): string {
  const amount = value.amount / 100
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}
