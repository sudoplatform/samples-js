import { VirtualCard } from '@sudoplatform/sudo-virtual-cards'
import { CachePolicy } from '@sudoplatform/sudo-common'
import { Modal, Descriptions, Spin, Alert } from 'antd'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../containers/AppContext'

interface Props {
  virtualCardId: string | undefined
  open: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const VirtualCardDetailModal: React.FC<Props> = ({
  virtualCardId,
  open,
  setVisible,
}) => {
  const { virtualCardsClient } = useContext(AppContext)
  const [virtualCard, setVirtualCard] = useState<VirtualCard | undefined>(
    undefined,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    if (!open || !virtualCardId) {
      return
    }
    setLoading(true)
    setError(undefined)
    setVirtualCard(undefined)
    virtualCardsClient
      .getVirtualCard({
        id: virtualCardId,
        cachePolicy: CachePolicy.RemoteOnly,
      })
      .then((result) => {
        setVirtualCard(result)
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [open, virtualCardId, virtualCardsClient])

  const handleClose = useCallback(() => {
    setVisible(false)
  }, [setVisible])

  return (
    <Modal
      title="Virtual Card Details (getVirtualCard)"
      open={open}
      onOk={handleClose}
      onCancel={handleClose}
      footer={null}
      width={700}
      getContainer={false}
    >
      {loading && (
        <Spin tip="Loading virtual card...">
          <div style={{ padding: 50 }} />
        </Spin>
      )}
      {error && (
        <Alert
          type="error"
          message="Failed to get virtual card"
          description={error.message}
        />
      )}
      {virtualCard && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="ID">{virtualCard.id}</Descriptions.Item>
          <Descriptions.Item label="Owner">
            {virtualCard.owner}
          </Descriptions.Item>
          <Descriptions.Item label="Version">
            {virtualCard.version}
          </Descriptions.Item>
          <Descriptions.Item label="State">
            {virtualCard.state}
          </Descriptions.Item>
          <Descriptions.Item label="Card Holder">
            {virtualCard.cardHolder}
          </Descriptions.Item>
          <Descriptions.Item label="Alias">
            {virtualCard.alias || '(none)'}
          </Descriptions.Item>
          <Descriptions.Item label="PAN">{virtualCard.pan}</Descriptions.Item>
          <Descriptions.Item label="Last 4">
            {virtualCard.last4}
          </Descriptions.Item>
          <Descriptions.Item label="CSC">{virtualCard.csc}</Descriptions.Item>
          <Descriptions.Item label="Expiry">
            {virtualCard.expiry.mm}/{virtualCard.expiry.yyyy}
          </Descriptions.Item>
          <Descriptions.Item label="Currency">
            {virtualCard.currency}
          </Descriptions.Item>
          <Descriptions.Item label="Funding Source ID">
            {virtualCard.fundingSourceId}
          </Descriptions.Item>
          <Descriptions.Item label="Billing Address">
            {virtualCard.billingAddress
              ? `${virtualCard.billingAddress.addressLine1}${
                  virtualCard.billingAddress.addressLine2
                    ? ', ' + virtualCard.billingAddress.addressLine2
                    : ''
                }, ${virtualCard.billingAddress.city}, ${
                  virtualCard.billingAddress.state
                } ${virtualCard.billingAddress.postalCode}, ${
                  virtualCard.billingAddress.country
                }`
              : '(none)'}
          </Descriptions.Item>
          <Descriptions.Item label="Owners">
            {virtualCard.owners.map((o) => `${o.id} (${o.issuer})`).join(', ')}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {virtualCard.createdAt.toUTCString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {virtualCard.updatedAt.toUTCString()}
          </Descriptions.Item>
          <Descriptions.Item label="Active To">
            {virtualCard.activeTo.toUTCString()}
          </Descriptions.Item>
          <Descriptions.Item label="Cancelled At">
            {virtualCard.cancelledAt
              ? virtualCard.cancelledAt.toUTCString()
              : '(none)'}
          </Descriptions.Item>
          <Descriptions.Item label="Metadata">
            {virtualCard.metadata
              ? JSON.stringify(virtualCard.metadata)
              : '(none)'}
          </Descriptions.Item>
          <Descriptions.Item label="Last Transaction">
            {virtualCard.lastTransaction
              ? `${virtualCard.lastTransaction.description} (${virtualCard.lastTransaction.type}) - ${virtualCard.lastTransaction.transactedAt.toUTCString()}`
              : '(none)'}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  )
}
