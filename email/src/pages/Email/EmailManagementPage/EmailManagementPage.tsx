import React from 'react'
import { Page, PageHeading, ContentRow } from '@components/Layout'
import { LearnMore } from '@components/LearnMore'
import { ProvisionEmailAddress } from '@components/Email/ProvisionEmailAddress'
import { EmailAddressList } from '@components/Email/EmailAddressList'

export const EmailManagementPage = (): React.ReactElement => {
  return (
    <Page>
      <PageHeading>Email</PageHeading>
      <ContentRow>
        <LearnMore
          nameText="Email"
          helpText="The Sudo Email Service provides the essentials to give your users their 
          own email address with the privacy and security benefits of a Sudo."
          helpUrl="https://docs.sudoplatform.com/guides/email/manage-email-addresses"
        />
      </ContentRow>
      <ContentRow>
        <ProvisionEmailAddress />
      </ContentRow>
      <ContentRow>
        <EmailAddressList />
      </ContentRow>
    </Page>
  )
}
