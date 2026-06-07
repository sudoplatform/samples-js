import { FundingSource } from '@sudoplatform/sudo-virtual-cards'
import { CachePolicy } from '@sudoplatform/sudo-common'
import { Modal, Descriptions, Spin, Alert } from 'antd'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { AppContext } from '../../containers/AppContext'

interface Props {
  fundingSourceId: string | undefined
  open: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

export const FundingSourceDetailModal: React.FC<Props> = ({
  fundingSourceId,
  open,
  setVisible,
}) => {
  const { virtualCardsClient } = useContext(AppContext)
  const [fundingSource, setFundingSource] = useState<FundingSource | undefined>(
    undefined,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    if (!open || !fundingSourceId) {
      return
    }
    setLoading(true)
    setError(undefined)
    setFundingSource(undefined)
    virtualCardsClient
      .getFundingSource({
        id: fundingSourceId,
        cachePolicy: CachePolicy.RemoteOnly,
      })
      .then((result) => {
        setFundingSource(result)
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [open, fundingSourceId, virtualCardsClient])

  const handleClose = useCallback(() => {
    setVisible(false)
  }, [setVisible])

  return (
    <Modal
      title="Funding Source Details (getFundingSource)"
      open={open}
      onOk={handleClose}
      onCancel={handleClose}
      footer={null}
      width={600}
      getContainer={false}
    >
      {loading && (
        <Spin tip="Loading funding source...">
          <div style={{ padding: 50 }} />
        </Spin>
      )}
      {error && (
        <Alert
          type="error"
          message="Failed to get funding source"
          description={error.message}
        />
      )}
      {fundingSource && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="ID">{fundingSource.id}</Descriptions.Item>
          <Descriptions.Item label="Owner">
            {fundingSource.owner}
          </Descriptions.Item>
          <Descriptions.Item label="Version">
            {fundingSource.version}
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            {fundingSource.type}
          </Descriptions.Item>
          <Descriptions.Item label="State">
            {fundingSource.state}
          </Descriptions.Item>
          <Descriptions.Item label="Currency">
            {fundingSource.currency}
          </Descriptions.Item>
          <Descriptions.Item label="Network">
            {fundingSource.network}
          </Descriptions.Item>
          <Descriptions.Item label="Card Type">
            {fundingSource.cardType}
          </Descriptions.Item>
          <Descriptions.Item label="Last 4">
            {fundingSource.last4}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {fundingSource.createdAt.toUTCString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {fundingSource.updatedAt.toUTCString()}
          </Descriptions.Item>
          <Descriptions.Item label="Transaction Velocity - Maximum">
            {fundingSource.transactionVelocity?.maximum ?? '(none)'}
          </Descriptions.Item>
          <Descriptions.Item label="Transaction Velocity - Velocity">
            {fundingSource.transactionVelocity?.velocity?.join(', ') ??
              '(none)'}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  )
}
