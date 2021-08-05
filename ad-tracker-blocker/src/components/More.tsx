import { SudoAdTrackerBlockerClient } from '@sudoplatform/sudo-ad-tracker-blocker'
import React from 'react'

import { Card, Button, HSpace, toast } from '@sudoplatform/web-ui'
import { useAsyncFn } from 'react-use'
import { ErrorFeedback } from './ErrorFeedback'

interface Props {
  atbClient: SudoAdTrackerBlockerClient
}

export const More: React.FC<Props> = ({ atbClient }) => {
  /**
   * Async callback: Resets client state
   */
  const [resetState, reset] = useAsyncFn(async () => {
    await atbClient.reset()
    await atbClient.update()
    void toast.success('Exceptions and rulesets reset to default')
  })

  /**
   * Async callback: Updates rulesets by fetching latest data from ATB service
   */
  const [rulesetsState, updateRulesets] = useAsyncFn(async () => {
    await atbClient.update()
    void toast.success('Rulesets updated')
  }, [atbClient])

  return (
    <Card title="More">
      <HSpace>
        <Button
          kind="primary"
          loading={rulesetsState.loading}
          onClick={updateRulesets}
        >
          Update Rulesets
        </Button>
        {rulesetsState.error && (
          <ErrorFeedback
            error={rulesetsState.error}
            message="There was an error updating the rulesets. Please try again."
          />
        )}

        <Button kind="primary" onClick={reset} loading={resetState.loading}>
          Reset Client
        </Button>
      </HSpace>
    </Card>
  )
}
