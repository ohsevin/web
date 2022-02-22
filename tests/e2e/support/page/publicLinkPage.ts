import { BrowserContext, Page } from 'playwright'
import { state } from '../../cucumber/environment/shared'
import { lastCreatedPublicLink } from './files/publicLink'
import { expect } from '@playwright/test'

export class PublicLinkPage {
  public context: BrowserContext
  private static page: Page

  async setup(): Promise<void> {
    this.context = await state.browser.newContext({ ignoreHTTPSErrors: true })
    PublicLinkPage.page = await this.context.newPage()
  }

  async navigateToPublicLink(): Promise<void> {
    await this.setup()
    await PublicLinkPage.page.goto(lastCreatedPublicLink)
  }

  async authenticatePassword(password: any): Promise<void> {
    await PublicLinkPage.page.fill('input[type="password"]', password)
    await PublicLinkPage.page
      .locator(
        '//*[@id="password-submit"]|//*[@id="oc-textinput-3"]/ancestor::div[contains(@class, "oc-mb-s")]/following-sibling::button'
      )
      .click()
  }

  async isFileVisible(file: string): Promise<void> {
    await expect(PublicLinkPage.page.locator(`text='${file}'`)).not.toBeVisible()
  }

  async logOut(): Promise<void> {
    await PublicLinkPage.page.close()
  }
}
