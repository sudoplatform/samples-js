import React, { useState } from 'react'
import { Page, PageHeading, ContentRow } from '@components/Layout'
import { LearnMore } from '@components/LearnMore'
import { ProvisionEmailMask } from '@components/Email/ProvisionEmailMask/ProvisionEmailMask'
import { EmailMaskList } from '@components/Email/EmailMaskList'

export const MaskPage = (): React.ReactElement => {
  const [showExternal, setShowExternal] = useState(false)

  return (
    <Page>
      <PageHeading>Masks</PageHeading>
      <ContentRow>
        <LearnMore
          nameText="Mask"
          helpText="The Sudo Email Service provides the essentials to provision Email Masks. 
          Masks are email addresses that your users can provision that, instead of being able to send or receive 
          email messages themselves, forward email messages to or from the user's real email address."
          helpUrl="https://docs.sudoplatform.com/guides/email/email-masks"
        />
      </ContentRow>
      <ContentRow>
        <ProvisionEmailMask
          showExternal={showExternal}
          onShowExternalChange={setShowExternal}
        />
      </ContentRow>
      <ContentRow>
        <EmailMaskList showExternal={showExternal} />
      </ContentRow>
    </Page>
  )
}
