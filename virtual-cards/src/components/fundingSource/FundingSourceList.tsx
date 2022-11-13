import { ListOutput } from '@sudoplatform/sudo-common'
import {
  FundingSource,
  FundingSourceState,
} from '@sudoplatform/sudo-virtual-cards'
import { Button } from '@sudoplatform/web-ui'
import { List } from 'antd'
import React, { useContext } from 'react'
import useAsyncFn, { AsyncState } from 'react-use/lib/useAsyncFn'
import { AppContext } from '../../containers/AppContext'

interface Props {
  listFundingSourcesResult: AsyncState<ListOutput<FundingSource>>
  onFundingSourceCancelled?: (fundingSource: FundingSource) => void
}

export const FundingSourceList: React.FC<Props> = (props) => {
  const { virtualCardsClient } = useContext(AppContext)
  const [cancelFundingSourceResult, cancelFundingSource] = useAsyncFn(
    async (fundingSource: FundingSource) => {
      await virtualCardsClient.cancelFundingSource(fundingSource.id)
      props.onFundingSourceCancelled?.(fundingSource)
    },
  )
  return (
    <List
      dataSource={props.listFundingSourcesResult.value?.items}
      loading={props.listFundingSourcesResult.loading}
      renderItem={(item) => (
        <List.Item key={item.id}>
          {item.state === FundingSourceState.Active ? (
            <>
              <List.Item.Meta
                title={`${item.network}`}
                description={`****${item.last4 ?? ''}`}
              />
              <Button
                danger={true}
                disabled={cancelFundingSourceResult.loading}
                loading={cancelFundingSourceResult.loading}
                onClick={() => cancelFundingSource(item)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <List.Item.Meta
              title={`${item.network} - Cancelled`}
              description={`****${item.last4 ?? ''}`}
            />
          )}
        </List.Item>
      )}
    ></List>
  )
}
