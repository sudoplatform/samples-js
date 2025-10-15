import {
  WebComponent,
  Browser,
  Page,
  findBy,
  elementIsVisible,
  Button,
  TextInput,
  DropdownInput,
  delay,
} from '@anonyome/selenium-common/lib'
import config from './utils'
import defaultSudo from '../../resources/sudo.json'
import { Person } from '../types'

export class SudoPage extends Page {
  constructor(browser: Browser) {
    super(browser)
    this.setUrl(`${config.baseUrl}/virtual-cards/sudos`)
    this.setMenuLink("a[href='/virtual-cards/sudos']")
  }

  @findBy("h2[class='sc-dkzDqf ibjoDH']")
  public PageTitle: WebComponent

  @findBy("div[class='ant-collapse-header'][aria-expanded='false']")
  public ExistingSudosList: WebComponent

  @findBy("input[id='firstName'")
  public firstNameInput: TextInput

  @findBy("input[id='lastName'")
  public lastNameInput: TextInput

  @findBy("input[id='label'")
  public sudoInput: TextInput

  @findBy("button[class-name='create-sudo']")
  public Submit: Button

  @findBy("button.delete-sudo")
  public Delete: Button

  @findBy("li[class='ant-list-item']")
  public sudoSucceeded: WebComponent

  @findBy("div[class='ant-list ant-list-split']")
  public existingSudoExpanded: WebComponent

  @findBy("button[class-name='create-virtual-card']")
  public SubmitVirtualCard: Button

  @findBy("input[id='cardHolder'")
  public cardHolderInput: TextInput

  @findBy("input[id='alias'")
  public aliasInput: TextInput

  @findBy("input[type='search']")
  public fundingSource: DropdownInput

  @findBy("div[class='rccs']")
  public virtualCardSucceeded: WebComponent

  public loadCondition() {   
    return elementIsVisible(() => this.Submit)
  }

  async expandPanels(): Promise<void> {
    await this.ExistingSudosList.click()
    await this.browser.wait(async () => await this.existingSudoExpanded.isDisplayed())
  }

  async createSudo(person?: Person): Promise<void> { 
    await this.firstNameInput.type(
      person?.firstName ? person.firstName : defaultSudo.firstName,
    )
    await this.lastNameInput.type(
      person?.lastName ? person.lastName : defaultSudo.lastName,
    )
    await this.sudoInput.type(person?.sudo ? person.sudo : defaultSudo.sudo)
    await this.Submit.click()

    await this.browser.wait(async () => await this.sudoSucceeded.isDisplayed())
  }

  async createVirtualCard(person?: Person): Promise<void> {
    console.log('Creating virtual card')

    await delay(config.shortWait)

    await this.cardHolderInput.type(
      person?.firstName ? `${person.firstName} ${person.lastName}` : `${defaultSudo.firstName} ${defaultSudo.lastName}`
    )
    await this.aliasInput.type(
      person?.lastName ? person.lastName : `${defaultSudo.lastName}_alias`,
    )
    await this.sudoInput.type(person?.sudo ? person.sudo : defaultSudo.sudo)

    await this.fundingSource.click()
    await this.fundingSource.enter()

    await this.SubmitVirtualCard.click()

    await this.browser.wait(async () => await this.virtualCardSucceeded.isDisplayed(), config.longWait)

    console.log('Created virtual card')
  }

  async deleteSudo(): Promise<void> {
    await this.Delete.click()
    // What we should do here is wait for the virtual card dropdown to not be visible, but the 
    // WebComponent infrastructure doesn't support this yet.
    await delay (config.shortWait)
  }
}
