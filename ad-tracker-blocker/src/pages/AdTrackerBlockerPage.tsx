import {
  AdTrackerBlockerClient,
  initWasm,
} from '@sudoplatform/sudo-ad-tracker-blocker'
import React, { useCallback, useState } from 'react'
import { Filtering } from '../components/Filtering'
import { More } from '../components/More'
import { Exceptions } from '../components/Exceptions'
import { Rulesets } from '../components/Rulesets'
import { Spinner, toast, VSpace } from '@sudoplatform/web-ui'
import { useAsync } from 'react-use'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { ErrorFeedback } from '../components/ErrorFeedback'

// Begin initialization of WebAssembly runtime
const initWasmPromise = initWasm((file) => `/${file}`)

interface Props {
  userClient: SudoUserClient
}

export const AdTrackerBlockerPage: React.FC<Props> = ({ userClient }) => {
  /**
   * Async Effect: Initializes the ATB client instance
   */
  const atbClient = useAsync(async () => {
    // Ensure that Web Assembly runtime is ready
    await initWasmPromise

    // Create the ATB client instance
    const client: AdTrackerBlockerClient = new AdTrackerBlockerClient({
      sudoUserClient: userClient,
      onStatusChanged: () => {
        void toast.info(`Filter engine status changed to: '${client.status}'`)
        handleClientChange()
      },
    })

    return client
  })

  /**
   * State: Time of last change made to ATB client
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

  return atbClient.error ? (
    <ErrorFeedback
      error={atbClient.error}
      message="An error occurred initializing AdTrackerBlockerClient."
    />
  ) : atbClient.value === undefined ? (
    <Spinner />
  ) : (
    <VSpace spacing="large">
      <Filtering
        atbClient={atbClient.value}
        lastClientChange={lastClientChange}
      />
      <Rulesets
        atbClient={atbClient.value}
        lastClientChange={lastClientChange}
      />
      <Exceptions
        lastChange={lastClientChange}
        atbClient={atbClient.value}
        onChange={handleClientChange}
      />
      <More atbClient={atbClient.value} />
    </VSpace>
  )
}
