import {
  Browser,
  BrowserType,
  ensure,
  delay,
} from '@anonyome/selenium-common/lib'

import { AllPages } from '../pageObjects'
import { Address, Person } from '../types'
import defaultFundingSource from '../../resources/funding-source.json'

describe('End to End Test', () => {
  jest.setTimeout(480000)
  let pages: AllPages

  beforeEach(async () => {
    pages = new AllPages(new Browser(BrowserType.CHROME))
  })

  it('navigates through each page and submits the form correctly', async () => {
    await pages.Home.navigate()
    await pages.Home.signIn()

    await pages.IdentityVerification.submitIdentityVerification()
    await ensure(pages.IdentityVerification.IDVStatus).textIs(
      'Status: Verified ✅',
    )
    await pages.Sudo.navigate()
    await pages.Sudo.expandPanels()
    await ensure(pages.Sudo.sudoSucceeded).isNotVisible()
    await pages.Sudo.createSudo()
    await ensure(pages.Sudo.sudoSucceeded).isVisible()

    await pages.FundingSource.navigate()
    await pages.FundingSource.createStripeFundingSource()
    await pages.Sudo.navigate()
    await pages.FundingSource.navigate()
    await pages.Sudo.navigate()
    await pages.FundingSource.navigate()
    await pages.FundingSource.createCheckoutBankAccountFundingSource(
      'custom_checking_500',
    )

    await pages.Sudo.navigate()
    await pages.Sudo.expandPanels()
    await pages.Sudo.createVirtualCard()

    await pages.OrphanedVirtualCards.navigate()
    await ensure(
      pages.OrphanedVirtualCards.OrphanedCardsNonEmpty,
    ).isNotVisible()

    await pages.Transactions.navigate()
    await pages.Transactions.getTransactions()
  })

  it('fails on identityVerification', async () => {
    const person: Person = {
      firstName: 'JohnFAILHERE',
      lastName: 'SmithFAILHERE',
      dateOfBirth: '28/02/1975',
      sudo: 'Shopping',
    }
    const address: Address = {
      addressLine1: '222333 Peachtree Place',
      city: 'Atlanta',
      state: 'GA',
      postalCode: '30318',
      country: 'US',
    }
    await pages.Home.navigate()
    await pages.Home.signIn()
    await pages.IdentityVerification.submitIdentityVerification(person, address)
    await ensure(pages.IdentityVerification.IDVStatus).textIs(
      'Status: Not Verified ❌',
    )
    await ensure(pages.IdentityVerification.alert).textIs(
      'Error: Failed to verify.',
    )
  })

  it('displays orphaned virtual cards', async () => {
    await pages.Home.navigate()
    await pages.Home.signIn()

    await pages.IdentityVerification.submitIdentityVerification()
    await ensure(pages.IdentityVerification.IDVStatus).textIs(
      'Status: Verified ✅',
    )
    await pages.Sudo.navigate()
    await pages.Sudo.expandPanels()
    await ensure(pages.Sudo.sudoSucceeded).isNotVisible()
    await pages.Sudo.createSudo()
    await ensure(pages.Sudo.sudoSucceeded).isVisible()

    await pages.FundingSource.navigate()
    await pages.FundingSource.createStripeFundingSource()

    await pages.Sudo.navigate()
    await pages.Sudo.expandPanels()
    await pages.Sudo.createVirtualCard()

    await pages.Sudo.deleteSudo()

    // This is a bit nasty with the delays, however the orphaned
    // virtual cards page can take a little
    // while to refresh and we don't have a user indicator of
    // when that is done.
    await pages.OrphanedVirtualCards.navigate()
    await delay(2000)
    await pages.Transactions.navigate()
    await delay(2000)
    await pages.OrphanedVirtualCards.navigate()
    await pages.OrphanedVirtualCards.waitForLoad()

    await ensure(pages.OrphanedVirtualCards.OrphanedCardsNonEmpty).isVisible()
  })

  afterEach(async () => {
    await pages.dispose()
  })
})
