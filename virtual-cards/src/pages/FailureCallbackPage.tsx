import React from 'react'
import { Button } from 'antd/es'
import { HSpace } from '@sudoplatform/web-ui'

export const FailureCallbackPage: React.FC = () => {
  function dispatchFailureEvent() {
    const event = new Event('3dsAuthenticationFailure')
    window.parent.document.dispatchEvent(event)
  }

  return (
    <>
      <HSpace>
        Failed to authenticate 3DS flow. Reload funding source page to try
        again.
        <div>
          <Button onClick={dispatchFailureEvent}>Close</Button>
        </div>
      </HSpace>
    </>
  )
}
