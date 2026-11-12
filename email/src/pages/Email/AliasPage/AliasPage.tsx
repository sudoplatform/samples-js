import React, { useState } from 'react'
import { Page, PageHeading, ContentRow } from '@components/Layout'
import { LearnMore } from '@components/LearnMore'
import { ProvisionEmailAlias } from '@components/Email/ProvisionEmailAlias/ProvisionEmailAlias'
import { EmailAliasList } from '@components/Email/EmailAliasList'

export const AliasPage = (): React.ReactElement => {
  const [showExternal, setShowExternal] = useState(false)

  return (
    <Page>
      <PageHeading>Aliases</PageHeading>
      <ContentRow>
        <LearnMore
          nameText="Alias"
          helpText="The Sudo Email Service provides the essentials to provision Email Aliases. 
          Aliases are email addresses that your users can provision that, instead of being able to send or receive 
          email messages themselves, forward email messages to or from the user's real email address."
          helpUrl="https://docs.sudoplatform.com/guides/email/email-aliases"
        />
      </ContentRow>
      <ContentRow>
        <ProvisionEmailAlias
          showExternal={showExternal}
          onShowExternalChange={setShowExternal}
        />
      </ContentRow>
      <ContentRow>
        <EmailAliasList showExternal={showExternal} />
      </ContentRow>
    </Page>
  )
}
