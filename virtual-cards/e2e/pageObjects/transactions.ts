import {
  WebComponent,
  Browser,
  Page,
  findBy,
  delay,
  DropdownInput,
  elementIsEnabled,
} from '@anonyome/selenium-common/lib'
import config from './utils'

export class TransactionsPage extends Page {
  constructor(browser: Browser) {
    super(browser)
    this.setUrl(`${config.baseUrl}/virtual-cards/transactions`)
    this.setMenuLink("a[href='/virtual-cards/transactions']")
  }

  @findBy("h2[class='sc-dkPtRN holjgQ']")
  public PageTitle: WebComponent

  @findBy("input[type='search']")
  public VirtualCard: DropdownInput

  @findBy("li[class='ant-list-item']")
  public listTransactionSucceeded: WebComponent

  public loadCondition() {
    return elementIsEnabled(() => this.VirtualCard)
  }

  async getTransactions(): Promise<void> {
    // delay for transaction to load
    await delay(1000)
    for (let i = 0; i < 5; i++) {
      try {
        await this.VirtualCard.click()
        await this.VirtualCard.enter()
        if (await this.listTransactionSucceeded.isDisplayed()) {
          await delay(1000)
          return
        }
      } catch {
        await delay(200)
      }
    }
  }
}
