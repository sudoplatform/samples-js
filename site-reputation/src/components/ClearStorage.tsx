import { SudoSiteReputationClient } from '@sudoplatform/sudo-site-reputation'
import { Button, Card, toast, VSpace } from '@sudoplatform/web-ui'
import React from 'react'
import { useAsyncFn } from 'react-use'
import { ErrorFeedback } from './ErrorFeedback'

interface Props {
  srClient: SudoSiteReputationClient
}

export const ClearStorage: React.FC<Props> = ({ srClient }) => {
  const [clearStorageState, clearStorage] = useAsyncFn(async () => {
    await srClient.clearStorage()
    void toast.success('Storage cleared.')
  }, [srClient])

  return (
    <Card title="Clear Storage">
      <VSpace spacing="medium">
        <Button
          kind="primary"
          onClick={clearStorage}
          loading={clearStorageState.loading}
        >
          Clear Storage
        </Button>
      </VSpace>
      {clearStorageState.error && (
        <ErrorFeedback
          error={clearStorageState.error}
          message="Error clearing storage."
        />
      )}
    </Card>
  )
}
