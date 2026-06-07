import { Transaction } from '@sudoplatform/sudo-virtual-cards'
import { CachePolicy } from '@sudoplatform/sudo-common'
import { Modal, Descriptions, Spin, Alert } from 'antd'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { AppContext } from '../../containers/AppContext'
import { formatCurrencyAmount } from '../../util/formatCurrencyAmount'

interface Props {
  transactionId: string | undefined
  open: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const TransactionDetailModal: React.FC<Props> = ({
  transactionId,
  open,
  setVisible,
}) => {
  const { virtualCardsClient } = useContext(AppContext)
  const [transaction, setTransaction] = useState<Transaction | undefined>(
    undefined,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    if (!open || !transactionId) {
      return
    }
    setLoading(true)
    setError(undefined)
    setTransaction(undefined)
    virtualCardsClient
      .getTransaction({
        id: transactionId,
        cachePolicy: CachePolicy.RemoteOnly,
      })
      .then((result) => {
        setTransaction(result)
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [open, transactionId, virtualCardsClient])

  const handleClose = useCallback(() => {
    setVisible(false)
  }, [setVisible])

  return (
    <Modal
      title="Transaction Details (getTransaction)"
      open={open}
      onOk={handleClose}
      onCancel={handleClose}
      footer={null}
      width={700}
      getContainer={false}
    >
      {loading && (
        <Spin tip="Loading transaction...">
          <div style={{ padding: 50 }} />
        </Spin>
      )}
      {error && (
        <Alert
          type="error"
          message="Failed to get transaction"
          description={error.message}
        />
      )}
      {transaction && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="ID">{transaction.id}</Descriptions.Item>
          <Descriptions.Item label="Owner">
            {transaction.owner}
          </Descriptions.Item>
          <Descriptions.Item label="Version">
            {transaction.version}
          </Descriptions.Item>
          <Descriptions.Item label="Type">{transaction.type}</Descriptions.Item>
          <Descriptions.Item label="Description">
            {transaction.description}
          </Descriptions.Item>
          <Descriptions.Item label="Card ID">
            {transaction.cardId}
          </Descriptions.Item>
          <Descriptions.Item label="Sequence ID">
            {transaction.sequenceId}
          </Descriptions.Item>
          <Descriptions.Item label="Billed Amount">
            {formatCurrencyAmount(transaction.billedAmount)}{' '}
            {transaction.billedAmount.currency}
          </Descriptions.Item>
          <Descriptions.Item label="Transacted Amount">
            {formatCurrencyAmount(transaction.transactedAmount)}{' '}
            {transaction.transactedAmount.currency}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {transaction.createdAt.toUTCString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {transaction.updatedAt.toUTCString()}
          </Descriptions.Item>
          <Descriptions.Item label="Transacted At">
            {transaction.transactedAt.toUTCString()}
          </Descriptions.Item>
          <Descriptions.Item label="Settled At">
            {transaction.settledAt
              ? transaction.settledAt.toUTCString()
              : '(none)'}
          </Descriptions.Item>
          <Descriptions.Item label="Decline Reason">
            {transaction.declineReason ?? '(none)'}
          </Descriptions.Item>
          {transaction.detail?.map((detail, idx) => (
            <Descriptions.Item key={idx} label={`Detail[${idx}]`}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Description">
                  {detail.description}
                </Descriptions.Item>
                <Descriptions.Item label="State">
                  {detail.state}
                </Descriptions.Item>
                <Descriptions.Item label="Virtual Card Amount">
                  {formatCurrencyAmount(detail.virtualCardAmount)}{' '}
                  {detail.virtualCardAmount.currency}
                </Descriptions.Item>
                <Descriptions.Item label="Markup Amount">
                  {formatCurrencyAmount(detail.markupAmount)}{' '}
                  {detail.markupAmount.currency}
                </Descriptions.Item>
                <Descriptions.Item label="Funding Source Amount">
                  {formatCurrencyAmount(detail.fundingSourceAmount)}{' '}
                  {detail.fundingSourceAmount.currency}
                </Descriptions.Item>
                <Descriptions.Item label="Funding Source ID">
                  {detail.fundingSourceId}
                </Descriptions.Item>
                <Descriptions.Item label="Markup">
                  {detail.markup.percent}% + {detail.markup.flat} flat (min:{' '}
                  {detail.markup.minCharge ?? 'n/a'})
                </Descriptions.Item>
                <Descriptions.Item label="Transacted At">
                  {detail.transactedAt
                    ? detail.transactedAt.toUTCString()
                    : '(none)'}
                </Descriptions.Item>
                <Descriptions.Item label="Settled At">
                  {detail.settledAt ? detail.settledAt.toUTCString() : '(none)'}
                </Descriptions.Item>
                <Descriptions.Item label="Continuation">
                  {detail.continuationOfExistingCharge ? 'Yes' : 'No'}
                </Descriptions.Item>
              </Descriptions>
            </Descriptions.Item>
          ))}
        </Descriptions>
      )}
    </Modal>
  )
}
