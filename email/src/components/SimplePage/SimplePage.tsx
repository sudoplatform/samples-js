import React from 'react'
import { FlexContainer, ContentContainer } from './SimplePage.styled'

interface Props {
  className?: string
  children?: React.ReactNode
}

/**
 * Generic page wrapper component for rendering centered content against a 'sudo tiles' background image.
 */
export const SimplePage = ({
  className,
  children,
}: Props): React.ReactElement => {
  return (
    <FlexContainer className={className}>
      <ContentContainer>{children}</ContentContainer>
    </FlexContainer>
  )
}
