import { Transaction } from '@sudoplatform/sudo-virtual-cards'
import {
  ListOperationResult,
  ListOperationResultStatus,
} from '@sudoplatform/sudo-common'
import { List } from 'antd'
import React from 'react'
import { AsyncState } from 'react-use/lib/useAsyncFn'
import { TransactionDetailList } from './TransactionDetailList'
import { formatCurrencyAmount } from '../../util/formatCurrencyAmount'

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
        itemLayout="vertical"
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
            <TransactionDetailList transaction={item} />
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
