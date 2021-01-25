import { SudoSiteReputationClient } from '@sudoplatform/sudo-site-reputation'
import { AutoComplete, Card, Feedback, VSpace } from '@sudoplatform/web-ui'
import React, { useEffect, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { ErrorFeedback } from './ErrorFeedback'

interface Props {
  srClient: SudoSiteReputationClient
  lastClientChange: number
}

export const GetSiteReputation: React.FC<Props> = ({
  srClient,
  lastClientChange,
}) => {
  const [url, setUrl] = useState<string>()

  /**
   * Callback: Gets reputation data for a given site
   */
  const [siteReputationState, getSiteReputation] = useAsyncFn(
    async () => (url ? srClient.getSiteReputation(url) : undefined),
    [srClient, url],
  )

  /**
   * Effect: Refreshes the component when `lastClientChange` prop changes
   */
  useEffect(() => {
    void getSiteReputation()
  }, [lastClientChange, getSiteReputation])

  return (
    <Card title="Get Site Reputation">
      <VSpace spacing="medium">
        <AutoComplete
          style={{ width: '100%' }}
          placeholder="Input a site to check"
          onChange={(value) => {
            setUrl(value)
            void getSiteReputation()
          }}
          options={[
            { value: 'wildnights.co.uk' },
            { value: 'tadoo.ca' },
            { value: 'aboveandbelow.com.au' },
            { value: 'endurotanzania.co.tz' },
          ]}
        />
        {siteReputationState.value && (
          <Feedback
            type={siteReputationState.value?.isMalicious ? 'error' : 'success'}
          >
            {siteReputationState.value?.isMalicious ? 'Malicious' : 'Safe'}
          </Feedback>
        )}
        {siteReputationState.error && (
          <ErrorFeedback
            error={siteReputationState.error}
            message={`Error getting reputation for ${url ?? 'url'}`}
          />
        )}
      </VSpace>
    </Card>
  )
}
