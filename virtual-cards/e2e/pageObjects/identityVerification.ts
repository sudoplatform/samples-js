import {
  WebComponent,
  Browser,
  Page,
  findBy,
  elementIsVisible,
  Button,
  TextInput,
} from '@anonyome/selenium-common/lib'
import config from './utils'
import defaultVerification from '../../resources/identity-verification.json'
import { Person, Address } from '../types'

export class IdentityVerificationPage extends Page {
  constructor(browser: Browser) {
    super(browser)
    this.setUrl(`${config.baseUrl}/virtual-cards/identity-verification`)
    this.setMenuLink("a[href='/virtual-cards/identity-verification']")
  }

  @findBy("h2[class='sc-dkPtRN holjgQ']")
  public PageTitle: WebComponent

  @findBy("h3[id='status']")
  public IDVStatus: WebComponent

  @findBy("input[id='firstName'")
  public firstNameInput: TextInput

  @findBy("input[id='lastName'")
  public lastNameInput: TextInput

  @findBy("input[id='address'")
  public addressInput: TextInput

  @findBy("input[id='city'")
  public cityInput: TextInput

  @findBy("input[id='state'")
  public stateInput: TextInput

  @findBy("input[id='postalCode'")
  public postalCodeInput: TextInput

  @findBy("input[id='country'")
  public countryInput: TextInput

  @findBy("input[id='dateOfBirth'")
  public dateOfBirthInput: TextInput

  @findBy("button[type='submit']")
  public Submit: Button

  @findBy("blockquote[class='sc-ksBlkl kkqBRA'")
  public alert: WebComponent

  public loadCondition() {
    return elementIsVisible(() => this.Submit)
  }

  async submitIdentityVerification(
    person?: Person,
    address?: Address,
  ): Promise<void> {
    await this.firstNameInput.clear()
    await this.firstNameInput.type(
      person?.firstName ? person.firstName : defaultVerification.firstName,
    )

    await this.lastNameInput.clear()
    await this.lastNameInput.type(
      person?.lastName ? person.lastName : defaultVerification.lastName,
    )

    await this.addressInput.clear()
    await this.addressInput.type(
      address?.addressLine1
        ? address.addressLine1
        : defaultVerification.address,
    )

    await this.cityInput.clear()
    await this.cityInput.type(
      address?.city ? address.city : defaultVerification.city,
    )

    await this.stateInput.clear()
    await this.stateInput.type(
      address?.state ? address.state : defaultVerification.state,
    )

    await this.postalCodeInput.clear()
    await this.postalCodeInput.type(
      address?.postalCode ? address.postalCode : defaultVerification.postalCode,
    )

    await this.countryInput.clear()
    await this.countryInput.type(
      address?.country
        ? address.country : defaultVerification.country,
    )

    await this.dateOfBirthInput.clear()
    await this.dateOfBirthInput.type(
      person?.dateOfBirth
        ? person.dateOfBirth
        : defaultVerification.dateOfBirth,
    )

    await this.Submit.click()

    await this.browser.wait(
      async () =>
        (await this.alert.isDisplayed()) ||
        (await this.IDVStatus.getText()) === 'Status: Verified ✅',
    )
  }
}
