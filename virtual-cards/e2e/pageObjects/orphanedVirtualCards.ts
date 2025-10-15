import {
  WebComponent,
  Browser,
  Page,
  findBy,
  elementIsVisible,
} from '@anonyome/selenium-common/lib'
import config from './utils'

export class OrphanedVirtualCardsPage extends Page {
  constructor(browser: Browser) {
    super(browser)
    this.setUrl(`${config.baseUrl}/virtual-cards/orphaned-virtual-cards`)
    this.setMenuLink("a[href='/virtual-cards/orphaned-virtual-cards']")
  }

  @findBy("h2[class-name='sc-dkzDqf ibjoDH']")
  public PageTitle: WebComponent

  @findBy("div[class='sc-gswNZR fnqhFk orphaned-virtual-cards']")
  public OrphanedCardsListHeader: WebComponent

  @findBy("li[class='ant-list-item']")
  public OrphanedCardsNonEmpty: WebComponent

  @findBy("div[class='ant-list-empty-text']")
  public OrphanedCardsEmpty: WebComponent

  public loadCondition() {
    return elementIsVisible(() => this.OrphanedCardsListHeader)        
  }

  async waitForLoad(): Promise<void> {
    await this.browser.wait(async () => await this.OrphanedCardsNonEmpty.isDisplayed())
  }

}
