import { SudoSiteReputationClient } from '@sudoplatform/sudo-site-reputation'
import { Button, Card, VSpace } from '@sudoplatform/web-ui'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { ErrorFeedback } from './ErrorFeedback'

interface Props {
  srClient: SudoSiteReputationClient
  lastClientChange: number
}

export const UpdateRuleset: React.FC<Props> = ({
  srClient,
  lastClientChange,
}) => {
  const [lastUpdatePerformedAt, setLastUpdatePerformedAt] = useState(
    srClient.lastUpdatePerformedAt,
  )
  const [updateState, update] = useAsyncFn(async () => {
    await srClient.update()
  }, [srClient])

  useEffect(() => {
    setLastUpdatePerformedAt(srClient.lastUpdatePerformedAt)
  }, [lastClientChange, setLastUpdatePerformedAt, srClient])

  return (
    <Card title="Update Ruleset">
      <VSpace spacing="medium">
        <Button kind="primary" onClick={update} loading={updateState.loading}>
          Update
        </Button>
        <div>
          {lastUpdatePerformedAt
            ? `Last update: ${moment(lastUpdatePerformedAt).format()}`
            : 'Update Required'}
        </div>
        {updateState.error && (
          <ErrorFeedback
            error={updateState.error}
            message="Error updating ruleset."
          />
        )}
      </VSpace>
    </Card>
  )
}
