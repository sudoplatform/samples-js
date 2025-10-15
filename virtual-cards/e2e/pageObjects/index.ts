import { HomePage } from './Home'
import { Browser } from '@anonyome/selenium-common/lib'
import { IdentityVerificationPage } from './IdentityVerification'
import { SudoPage } from './Sudos'
import { FundingSourcePage } from './FundingSources'
import { TransactionsPage } from './Transactions'
import { OrphanedVirtualCardsPage } from './orphanedVirtualCards'

export { HomePage }

export class AllPages {
  public Home: HomePage
  public IdentityVerification: IdentityVerificationPage
  public Sudo: SudoPage
  public FundingSource: FundingSourcePage
  public OrphanedVirtualCards: OrphanedVirtualCardsPage
  public Transactions: TransactionsPage

  constructor(public browser: Browser) {
    this.Home = new HomePage(browser)
    this.IdentityVerification = new IdentityVerificationPage(browser)
    this.Sudo = new SudoPage(browser)
    this.FundingSource = new FundingSourcePage(browser)
    this.OrphanedVirtualCards = new OrphanedVirtualCardsPage(browser)
    this.Transactions = new TransactionsPage(browser)
  }

  public async dispose(): Promise<void> {
    await this.browser.close()
  }
}
