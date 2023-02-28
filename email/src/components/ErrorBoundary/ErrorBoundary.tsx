import React, { useEffect } from 'react'
import { Feedback } from '@sudoplatform/web-ui'
import { ErrorContainer, ErrorTextBlock } from './ErrorBoundary.styled'

export interface BoundaryErrorObject {
  error: Error
  message: string
  fatal?: boolean
}

interface Props {
  error?: BoundaryErrorObject
  children?: React.ReactNode
}

const ErrorBlock = ({
  error,
}: {
  error: BoundaryErrorObject
}): React.ReactElement => {
  return (
    <ErrorContainer>
      <Feedback type="error">
        {error.message ?? 'An error occurred:'}
        <ErrorTextBlock>
          {error.error.name}: {error.error.message}
        </ErrorTextBlock>
        See console for more info.
      </Feedback>
    </ErrorContainer>
  )
}

export const ErrorBoundary = ({
  error,
  children,
}: Props): React.ReactElement => {
  useEffect(() => {
    if (error) {
      console.error(error)
    }
  }, [error])

  return error ? (
    error.fatal ? (
      <ErrorBlock error={error} />
    ) : (
      <>
        <ErrorBlock error={error} />
        {children}
      </>
    )
  ) : (
    <>{children}</>
  )
}
