import {
  Browser,
  Page,
  findBy,
  Button,
  elementIsVisible,
  WebComponent,
} from '@anonyome/selenium-common/lib'
import config from './utils'

export class HomePage extends Page {
  constructor(browser: Browser) {
    super(browser)
    this.setUrl(`${config.baseUrl}`)
  }

  @findBy("h2[class='sc-dkPtRN holjgQ'")
  public PageTitle: WebComponent

  @findBy("button[type='button']")
  public Submit: Button

  @findBy("section[class='ant-layout ant-layout-has-sider']")
  public LoginSucceeded: WebComponent

  public loadCondition() {
    return elementIsVisible(() => this.Submit)
  }
  async signIn(): Promise<void> {
    await this.Submit.click()
    await this.browser.wait(async () => await this.LoginSucceeded.isDisplayed(), config.longWait)
  }
}
