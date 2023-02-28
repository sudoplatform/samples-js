import React, { useEffect } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import {
  GreenText,
  RedText,
  StyledContainer,
  StyledMessageContainer,
} from './EmailAddressAvailability.styled'
import { useEmailAddressAvailability } from '@hooks/useEmailAddressAvailability'
import { ErrorBoundary } from '@components/ErrorBoundary'

interface Props {
  localPart: string
  domain: string
  onAvailabilityRetrieved: (available?: boolean) => void
}

export const EmailAddressAvailability = ({
  localPart,
  domain,
  onAvailabilityRetrieved,
}: Props): React.ReactElement => {
  const {
    emailAddressAvailabilityLoading,
    emailAddressAvailabilityError,
    emailAddressAvailabilityResult,
  } = useEmailAddressAvailability(localPart, domain)

  useEffect(() => {
    onAvailabilityRetrieved(emailAddressAvailabilityResult)
  }, [emailAddressAvailabilityResult, onAvailabilityRetrieved])

  return (
    <>
      <ErrorBoundary error={emailAddressAvailabilityError}>
        <StyledContainer>
          {localPart}@{domain}:{' '}
          {emailAddressAvailabilityLoading ? (
            <LoadingOutlined style={{ marginLeft: '5px' }} />
          ) : (
            <StyledMessageContainer id="email-availability-message">
              {emailAddressAvailabilityResult ? (
                <GreenText>Available</GreenText>
              ) : (
                <RedText>Not Available</RedText>
              )}
            </StyledMessageContainer>
          )}
        </StyledContainer>
      </ErrorBoundary>
    </>
  )
}
