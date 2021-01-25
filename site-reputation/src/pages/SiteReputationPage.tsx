import React, { useCallback, useState } from 'react'
import { Spinner, toast, VSpace } from '@sudoplatform/web-ui'
import { useAsync } from 'react-use'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { ErrorFeedback } from '../components/ErrorFeedback'
import { SudoSiteReputationClient } from '@sudoplatform/sudo-site-reputation'
import { UpdateRuleset } from '../components/UpdateRuleset'
import { GetSiteReputation } from '../components/GetSiteReputation'
import { ClearStorage } from '../components/ClearStorage'

interface Props {
  userClient: SudoUserClient
}

export const SiteReputationPage: React.FC<Props> = ({ userClient }) => {
  /**
   * State: Time of last change made to SR client
   * This is passed to child components so they know when to refresh.
   */
  const [lastClientChange, setLastClientChange] = useState(0)

  /**
   * Callback: Updates `lastClientChange` state
   */
  const handleClientChange = useCallback(
    () => setLastClientChange(Date.now()),
    [setLastClientChange],
  )

  /**
   * Async Effect: Initializes the Site Reputation client instance
   */
  const siteReputationClient = useAsync(async () => {
    // Create the SR client instance
    const client: SudoSiteReputationClient = new SudoSiteReputationClient({
      sudoUserClient: userClient,
      onStatusChanged: () => {
        void toast.info(
          `Site reputation client status changed to: '${client.status}'`,
        )
        handleClientChange()
      },
    })

    return client
  })

  return siteReputationClient.error ? (
    <ErrorFeedback
      error={siteReputationClient.error}
      message="An error occurred initializing SudoSiteReputationClient."
    />
  ) : siteReputationClient.value === undefined ? (
    <Spinner />
  ) : (
    <VSpace spacing="large">
      <UpdateRuleset
        srClient={siteReputationClient.value}
        lastClientChange={lastClientChange}
      />
      <GetSiteReputation
        srClient={siteReputationClient.value}
        lastClientChange={lastClientChange}
      />
      <ClearStorage srClient={siteReputationClient.value} />
    </VSpace>
  )
}
