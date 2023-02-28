import React, { useEffect } from 'react'
import { Feedback } from '@sudoplatform/web-ui'
import { ErrorTextBlock } from './ErrorFeedback.styled'

interface Props {
  error: Error
  message?: string
}

export const ErrorFeedback = (props: Props): React.ReactElement => {
  useEffect(() => {
    console.error(props.error)
  })

  return (
    <Feedback type="error">
      {props.message ?? 'An error occurred:'}
      <ErrorTextBlock>
        {props.error.name}: {props.error.message}
      </ErrorTextBlock>
      See console for more info.
    </Feedback>
  )
}
