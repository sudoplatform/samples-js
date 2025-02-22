import { Transaction } from '@sudoplatform/sudo-virtual-cards'
import { List } from 'antd'
import React from 'react'
import { formatCurrencyAmount } from '../../util/formatCurrencyAmount'
interface Props {
  transaction?: Transaction
}

export const TransactionDetailList: React.FC<Props> = (props) => {
  if (!props.transaction) {
    return <List dataSource={[]} />
  }
  return (
    <List
      dataSource={props.transaction.detail}
      renderItem={(item) => (
        <>
          Transaction Detail:
          <List.Item>
            &nbsp;&nbsp;--&nbsp;&nbsp;{item.description} ({item.state}
            )&nbsp;&nbsp;&nbsp;&nbsp;
            {formatCurrencyAmount(item.virtualCardAmount)}{' '}
            {item.virtualCardAmount.currency}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp; TransactedAt:{' '}
            {item.transactedAt ? item.transactedAt.toUTCString() : '(none)'}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp; SettledAt:{' '}
            {item.settledAt ? item.settledAt.toUTCString() : '(none)'}
          </List.Item>
        </>
      )}
    />
  )
}
