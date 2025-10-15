import {
  WebComponent,
  Browser,
  Page,
  findBy,
  elementIsVisible,
  Button,
  TextInput,
  delay,
} from '@anonyome/selenium-common/lib'
import config from './utils'
import defaultFundingSource from '../../resources/funding-source.json'
import { Card, Address } from '../types'

export class FundingSourcePage extends Page {
  constructor(browser: Browser) {
    super(browser)
    this.setUrl(`${config.baseUrl}/virtual-cards/funding-sources`)
    this.setMenuLink("a[href='/virtual-cards/funding-sources']")
  }

  @findBy("h2[class='sc-dkPtRN holjgQ']")
  public PageTitle: WebComponent

  // @findBy("div[class='ant-collapse']")
  // public FundingSourcesPanel = WebComponent

  @findBy("iframe[title='Secure card payment input frame']")
  public StripePaymentInput: WebComponent

  @findBy("div[class='ant-collapse-item'][id='stripe']")
  public StripeCollapsedPanel: WebComponent

  @findBy("div[class='ant-collapse-item'][id='checkoutBankAccount']")
  public CheckoutBankAccountCollapsedPanel: WebComponent

  @findBy("input[name='cardnumber']")
  public cardNumberInput: TextInput

  @findBy("input[name='exp-date']")
  public expiryDateInput: TextInput

  @findBy("input[name='cvc']")
  public securityCodeInput: TextInput

  @findBy("input[id='addressLine1']")
  public addressLine1Input: TextInput

  @findBy("input[id='addressLine2']")
  public addressLine2Input: TextInput

  @findBy("input[id='city']")
  public cityInput: TextInput

  @findBy("input[id='state']")
  public stateInput: TextInput

  @findBy("input[id='postalCode']")
  public postalCodeInput: TextInput

  @findBy("input[id='country']")
  public countryInput: TextInput

  @findBy("button[type='submit']")
  public Submit: Button

  @findBy("input[type='checkbox']")
  public Checkbox: Button

  @findBy("button[type='button'][id='aut-button']")
  public PlaidButton: Button

  @findBy("button[type='submit'][id='aut-button']")
  public PlaidSubmit: Button

  @findBy("input[type='radio']")
  public PlaidRadio: Button

  @findBy("button[type='button'][id='aut-ins_109508']")
  public PlaidFirstPlatypusBankButton: Button

  @findBy("li[class='ant-list-item']")
  public fundingSourceSucceeded: WebComponent

  @findBy("button[id='checkout-bank-account-launch-plaid']")
  public checkoutBankAccountLaunchPlaid: Button

  @findBy("button[id='checkout-bank-account-submit-funding-source'")
  public checkoutBankAccountSubmit: Button

  @findBy("iframe[title='Plaid Link']")
  public checkoutBankAccountPlaidLinkIFrame: WebComponent

  @findBy("iframe[id='plaid-link-iframe-2']")
  public checkoutBankAccountPlaidLinkIFrame2: WebComponent

  @findBy("input[id='search-input'][name='query'][type='text']")
  public checkoutBankSearchInput: TextInput

  @findBy("input[id='aut-input-0'][type='text']")
  public PlaidUsernameInput: TextInput

  @findBy("input[id='aut-input-1'][type='password']")
  public PlaidPasswordInput: TextInput

  public loadCondition() {
    return elementIsVisible(() => this.CheckoutBankAccountCollapsedPanel)
  }

  async createStripeFundingSource(
    card?: Card,
    address?: Address,
  ): Promise<void> {
    console.log('Creating Stripe funding source')
    if (!(await this.StripePaymentInput.isDisplayed())) {
      await this.browser.wait(
        async () => await this.StripeCollapsedPanel.isDisplayed(),
      )
      // expand it
      await this.StripeCollapsedPanel.click()
    }

    await this.browser.wait(
      async () => await this.StripePaymentInput.isDisplayed(),
    )
    // We have to change the driver frame to access the "Card Details" properties
    // This function returns the input elements on the page so we can write to them
    await this.browser.switchDriverFrame(
      "iframe[title='Secure card payment input frame']",
    )

    await this.cardNumberInput.clear()
    await this.cardNumberInput.type(
      card?.cardNumber
        ? card.cardNumber
        : defaultFundingSource.creditCardNumber,
    )

    await this.expiryDateInput.clear()
    await this.expiryDateInput.type(
      card?.expiryDate ? card.expiryDate : defaultFundingSource.expiryDate,
    )

    await this.securityCodeInput.clear()
    await this.securityCodeInput.type(
      card?.securityCode
        ? card.securityCode
        : defaultFundingSource.securityCode,
    )

    // As we have changed the browser frame to only look inside the Card Input element,
    // we need to reset the driver frame back to the page itself.
    await this.browser.resetDriverFrame()

    await this.addressLine1Input.clear()
    await this.addressLine1Input.type(
      address?.addressLine1
        ? address.addressLine1
        : defaultFundingSource.addressLine1,
    )

    await this.addressLine2Input.clear()
    await this.addressLine2Input.type(
      address?.addressLine2
        ? address.addressLine2
        : defaultFundingSource.addressLine2,
    )

    await this.cityInput.clear()
    await this.cityInput.type(
      address?.city ? address.city : defaultFundingSource.city,
    )

    await this.stateInput.clear()
    await this.stateInput.type(
      address?.state ? address.state : defaultFundingSource.state,
    )

    await this.postalCodeInput.clear()
    await this.postalCodeInput.type(
      address?.postalCode
        ? address.postalCode
        : defaultFundingSource.postalCode,
    )

    await this.countryInput.clear()
    await this.countryInput.type(
      address?.country ? address.country : defaultFundingSource.country,
    )

    await this.browser.wait(async () => await this.Submit.isEnabled())
    await this.Submit.click()

    await this.browser.wait(
      async () => await this.fundingSourceSucceeded.isDisplayed(),
      24000,
    )
    console.log('Created Stripe funding source')
  }

  async createCheckoutBankAccountFundingSource(
    userName: string,
  ): Promise<void> {
    console.log('Creating Checkout bank account funding source', {
      now: new Date(),
    })

    if (!(await this.checkoutBankAccountSubmit.isDisplayed())) {
      // expand it
      await this.CheckoutBankAccountCollapsedPanel.click()
    }

    console.log('Waiting for Launch Plaid button to be enabled', {
      now: new Date(),
    })
    await this.browser.wait(
      async () => await this.checkoutBankAccountLaunchPlaid.isEnabled(),
      30000,
    )
    console.log('Clicking button')
    await this.checkoutBankAccountLaunchPlaid.click()
    console.log('Waiting for Plaid Link IFrame to be displayed', {
      now: new Date(),
    })

    await this.browser.wait(
      async () => await this.checkoutBankAccountPlaidLinkIFrame.isDisplayed(),
      30000,
    )
    console.log('Switching frame to Plaid Link IFrame', { now: new Date() })
    await this.browser.switchDriverFrame("iframe[title='Plaid Link']")

    console.log('Waiting for continue button to be visible', {
      now: new Date(),
    })
    await this.browser.wait(async () => await this.PlaidButton.isDisplayed())

    console.log('Waiting for continue button to be enabled', {
      now: new Date(),
    })
    await this.browser.wait(async () => await this.PlaidButton.isEnabled())

    console.log('Clicking continue button', { now: new Date() })
    await this.PlaidButton.click()

    console.log('Waiting for search input to be displayed', { now: new Date() })
    await this.browser.wait(
      async () => await this.checkoutBankSearchInput.isDisplayed(),
    )

    console.log('Typing first platypus bank', { now: new Date() })
    await this.checkoutBankSearchInput.type('First Platypus Bank')

    console.log('Waiting for First Platypus Bank button to appear', {
      now: new Date(),
    })
    await this.browser.wait(
      async () => await this.PlaidFirstPlatypusBankButton.isDisplayed(),
    )
    console.log(
      'Clicking First Platypus Bank button for first time to expand list',
      { now: new Date() },
    )
    await this.PlaidFirstPlatypusBankButton.click()
    await delay(1000)

    console.log(
      'Clicking First Platypus Bank button for second time to go to credentials screen',
      { now: new Date() },
    )
    await this.PlaidFirstPlatypusBankButton.click()

    console.log('Waiting for username input to appear', { now: new Date() })
    await this.browser.wait(
      async () => await this.PlaidUsernameInput.isDisplayed(),
    )
    console.log('Typing user name', { now: new Date() })
    await this.PlaidUsernameInput.type(userName)
    console.log('Waiting for password input to appear', { now: new Date() })
    await this.browser.wait(
      async () => await this.PlaidPasswordInput.isDisplayed(),
    )
    console.log('Typing password', { now: new Date() })
    await this.PlaidPasswordInput.type('blah')
    console.log('Waiting for authentication submit button to appear', {
      now: new Date(),
    })
    await this.browser.wait(async () => await this.PlaidSubmit.isDisplayed())
    console.log('Clicking authentication submit button', { now: new Date() })
    await this.PlaidSubmit.click()

    console.log('Waiting for account selection radio button to appear', {
      now: new Date(),
    })
    await this.browser.wait(async () => await this.PlaidRadio.isDisplayed())
    console.log('Waiting for account selection radio button to be enabled', {
      now: new Date(),
    })
    await this.browser.wait(async () => await this.PlaidRadio.isEnabled())
    console.log('Clicking account selection radio button', { now: new Date() })
    await this.PlaidRadio.click()

    console.log('Waiting for continue button to be enabled', {
      now: new Date(),
    })
    await this.browser.wait(async () => await this.PlaidButton.isEnabled())
    console.log('Clicking continue button', { now: new Date() })
    await this.PlaidButton.click()
    console.log('Waiting for continue button to disappear', { now: new Date() })
    await this.browser.wait(async () => !(await this.PlaidButton.isDisplayed()))
    console.log('Waiting for continue button to be displayed again', {
      now: new Date(),
    })
    await this.browser.wait(
      async () => await this.PlaidButton.isDisplayed(),
      60000,
    )
    console.log('Clicking continue button', { now: new Date() })
    await this.PlaidButton.click()

    // Now back to main form
    console.log('Resetting driver frame', { now: new Date() })
    await this.browser.resetDriverFrame()

    console.log('Waiting for agreement checkbox to be enabled', {
      now: new Date(),
    })
    await this.browser.wait(async () => await this.Checkbox.isEnabled(), 60000)
    console.log('Clicking agreement checkbox', { now: new Date() })
    await this.Checkbox.click()

    console.log('Waiting for funding source submit button to be enabled', {
      now: new Date(),
    })
    await this.browser.wait(
      async () => await this.checkoutBankAccountSubmit.isEnabled(),
    )
    console.log('Clicking funding source submit button', { now: new Date() })
    await this.checkoutBankAccountSubmit.click()

    await this.browser.wait(
      async () => await this.fundingSourceSucceeded.isDisplayed(),
      20000,
    )
    console.log('Created Checkout bank account funding source')
  }
}
