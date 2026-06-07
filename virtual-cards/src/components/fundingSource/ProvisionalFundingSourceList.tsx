import {
  ProvisionalFundingSource,
  ProvisionalFundingSourceState,
} from '@sudoplatform/sudo-virtual-cards'
import { CachePolicy, ListOutput } from '@sudoplatform/sudo-common'
import { Button } from '@sudoplatform/web-ui'
import { Collapse, List, Tag } from 'antd'
import React, { useContext, useEffect } from 'react'
import { useAsyncFn } from 'react-use'
import { AppContext } from '../../containers/AppContext'

const stateColor: Record<ProvisionalFundingSourceState, string> = {
  [ProvisionalFundingSourceState.Pending]: 'processing',
  [ProvisionalFundingSourceState.Provisioning]: 'warning',
  [ProvisionalFundingSourceState.Completed]: 'success',
  [ProvisionalFundingSourceState.Failed]: 'error',
}

export const ProvisionalFundingSourceList: React.FC = () => {
  const { virtualCardsClient } = useContext(AppContext)

  const [listResult, listProvisionalFundingSources] = useAsyncFn(async () => {
    return await virtualCardsClient.listProvisionalFundingSources({
      cachePolicy: CachePolicy.RemoteOnly,
    })
  })

  const [cancelResult, cancelProvisionalFundingSource] = useAsyncFn(
    async (id: string) => {
      await virtualCardsClient.cancelProvisionalFundingSource(id)
      void listProvisionalFundingSources()
    },
  )

  useEffect(() => {
    void listProvisionalFundingSources()
  }, [listProvisionalFundingSources])

  const items: ProvisionalFundingSource[] =
    (listResult.value as ListOutput<ProvisionalFundingSource>)?.items ?? []

  return (
    <>
      <h4>Provisional Funding Sources</h4>
      <Collapse
        items={[
          {
            key: 'info',
            label: 'About Provisional Funding Sources',
            children: (
              <p>
                Once the first funding source is created, this application
                creates a provisional funding source in advance of additional
                funding source creation, which is why there may be one
                additional provisional funding source in progress. If you cancel
                this provisional funding source, the app will crash when you try
                and add the next funding source.
              </p>
            ),
          },
        ]}
      />
      <List
        dataSource={items}
        loading={listResult.loading}
        locale={{ emptyText: 'No provisional funding sources' }}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta
              title={
                <>
                  {item.type} **** {item.last4}{' '}
                  <Tag color={stateColor[item.state]}>{item.state}</Tag>
                </>
              }
              description={`Created: ${item.createdAt.toUTCString()}`}
            />
            {item.state !== ProvisionalFundingSourceState.Completed &&
              item.state !== ProvisionalFundingSourceState.Failed && (
                <Button
                  danger={true}
                  disabled={cancelResult.loading}
                  loading={cancelResult.loading}
                  onClick={() => cancelProvisionalFundingSource(item.id)}
                >
                  Cancel
                </Button>
              )}
          </List.Item>
        )}
      />
    </>
  )
}
