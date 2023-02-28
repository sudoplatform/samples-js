import React from 'react'
import { PageHeading } from '@components/Layout'
import { Mailbox } from '@components/Email/Mailbox'
import { StyledPage } from './MailboxPage.styled'

export const MailboxPage = (): React.ReactElement => {
  return (
    <StyledPage>
      <PageHeading>Mailbox</PageHeading>
      <Mailbox />
    </StyledPage>
  )
}
