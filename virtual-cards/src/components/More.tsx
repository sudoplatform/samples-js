import { SudoProfilesClient } from '@sudoplatform/sudo-profiles'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { Button, Card, HSpace } from '@sudoplatform/web-ui'
import React from 'react'
import { useAsyncFn } from 'react-use'
import { ErrorFeedback } from './ErrorFeedback'
import { Navigate } from 'react-router-dom'

interface Props {
  userClient: SudoUserClient
  profilesClient: SudoProfilesClient
}
export const More: React.FC<Props> = (props) => {
  const [deregisterResult, deregister] = useAsyncFn(async () => {
    await props.profilesClient.reset()
    await props.userClient.reset()
    return 'complete'
  })

  return (
    <Card title="More">
      <HSpace>
        <Button kind="primary" onClick={deregister}>
          Unregister
        </Button>
        {deregisterResult.error ? (
          <ErrorFeedback
            error={deregisterResult.error}
            message="An error occurred while deregistering"
          />
        ) : (
          deregisterResult.value === 'complete' && <Navigate to="/" />
        )}
      </HSpace>
    </Card>
  )
}
