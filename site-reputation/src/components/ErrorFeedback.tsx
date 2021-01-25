import { Feedback } from '@sudoplatform/web-ui'
import React, { useEffect } from 'react'
import styled from 'styled-components'

const StyledBlockquote = styled.blockquote`
  font-family: monospace;
  margin: 10px 20px;
  border-left: 2px solid rgba(0, 0, 0, 0.1);
  padding-left: 10px;
`

interface Props {
  error: Error
  message?: string
}

export const ErrorFeedback: React.FC<Props> = (props) => {
  useEffect(() => {
    console.error(props.error)
  })

  return (
    <Feedback type="error">
      {props.message ?? 'An error occurred:'}
      <StyledBlockquote>
        {props.error.name}: {props.error.message}
      </StyledBlockquote>
      See console for more info.
    </Feedback>
  )
}
