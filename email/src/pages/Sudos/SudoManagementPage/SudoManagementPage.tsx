import React from 'react'
import { SudoCreate } from '@components/Sudo/SudoCreate'
import { SudoList } from '@components/Sudo/SudoList'
import { Page, PageHeading, ContentRow } from '@components/Layout'
import { LearnMore } from '@components/LearnMore'

/**
 * The `Sudo Management` page handles Sudo identities
 * at the <Project> container level. This is where
 * the user will interact with all Sudos belonging
 * to their account.
 */
export const SudoManagementPage = (): React.ReactElement => {
  return (
    <Page>
      <PageHeading>Sudo Management</PageHeading>
      <ContentRow>
        <LearnMore
          nameText="Sudo Management"
          helpText="Email addresses must belong to a Sudo. 
          A Sudo is a digital identity created and owned by a real person."
          helpUrl="https://docs.sudoplatform.com/guides/sudos/managing-sudos"
        />
      </ContentRow>
      <ContentRow>
        <SudoCreate />
      </ContentRow>
      <ContentRow>
        <SudoList />
      </ContentRow>
    </Page>
  )
}
