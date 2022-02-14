import { Actor } from '../../types'
import { filesCta } from '../../cta'
import { Locator, expect } from '@playwright/test'

export class PublicLink {
  private readonly actor: Actor
  private readonly publicLinkButtonLocator: Locator
  private readonly publicLinkPasswordLocator: Locator
  private readonly publicLinkNameLocator: Locator
  private readonly roleDropdownLocator: Locator
  private readonly expirationDateDropdownLocator: Locator
  private readonly createLinkButtonLocator: Locator
  private readonly publicLinkLocator: Locator
  private readonly yearButtonLocator: Locator
  private readonly nextSpanYearLocator: Locator


  constructor({ actor }: { actor: Actor }) {
    this.actor = actor
    this.publicLinkButtonLocator = this.actor.page.locator('#files-file-link-add')
    this.publicLinkPasswordLocator = this.actor.page.locator('#oc-files-file-link-password')
    this.publicLinkNameLocator = this.actor.page.locator('#oc-files-file-link-name')
    this.roleDropdownLocator = this.actor.page.locator('//*[@id="vs3__combobox"]')
    this.expirationDateDropdownLocator = this.actor.page.locator('#files-links-expiration-btn')
    this.createLinkButtonLocator = this.actor.page.locator('#oc-files-file-link-create')
    this.publicLinkLocator = this.actor.page.locator(
      '//a[@class = "oc-files-file-link-url oc-text-truncate"]'
    )
    this.yearButtonLocator = this.actor.page.locator(
      `//div[@class = "vc-nav-container"]/div[@class="vc-nav-header"]//span[position()=2]`
    )
    this.nextSpanYearLocator = this.actor.page.locator(
      `//div[@class = "vc-nav-container"]/div[@class="vc-nav-header"]//span[position()=3]`
    )
  }

  async selectRole(role: string): Promise<void> {
    await this.roleDropdownLocator.click()
    // role locator
    await this.actor.page
      .locator(`//ul[@id = "vs3__listbox"]//li/span[@id="files-role-${role}"]`)
      .click()
  }

  async selectExpiryMonth(year: string, month: string): Promise<void> {
    const monthLocator = await this.actor.page.locator(
      `//div[@class = "vc-nav-container"]/div[@class="vc-nav-items"]//span[@data-id='${year}.${month}']`
    )
    await monthLocator.click()
  }

  async selectExpiryDay(dayMonthYear: string): Promise<void> {
    const dayLocator = await this.actor.page.locator(
      `//div[@id = 'oc-files-file-link-expire-date']//span[@tabindex='-1' or @tabindex='0'][@aria-label='${dayMonthYear}']`
    )
    await dayLocator.click()
  }

  isValidDate = (expiryDate: string): void => {
    const parsedDate = new Date(expiryDate)
    if (new Date().getTime() - parsedDate.getTime() > 0) {
      throw new Error('The Provided date is Already Expired !!')
    }
  }

  async selectDate(dataOfExpiration: string): Promise<void> {
    const splitDate = dataOfExpiration.split('-')
    await this.expirationDateDropdownLocator.click()
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    const dateToday = new Date()
    const expiryDate = new Date(dataOfExpiration)
    const dayMonthYear =
      days[expiryDate.getDay()] +
      ', ' +
      months[expiryDate.getMonth()] +
      ' ' +
      expiryDate.getDate() +
      ', ' +
      expiryDate.getFullYear()
    const monthAndYear = months[dateToday.getMonth()] + ' ' + dateToday.getFullYear()
    // month and day dropdown locator click
    await this.actor.page
      .locator(`//div[@class = 'vc-title'][contains(text(), '${monthAndYear}')]`)
      .click()

    if ((await this.yearButtonLocator.innerText()) !== splitDate[0]) {
      await this.yearButtonLocator.click()
      while (true) {
        const nextYearSpanValue = await this.yearButtonLocator.innerText()
        const splitNextSpanYear = nextYearSpanValue.split('-')
        if (
          parseInt(splitDate[0]) >= parseInt(splitNextSpanYear[0]) &&
          parseInt(splitDate[0]) <= parseInt(splitNextSpanYear[1])
        ) {
          const yearLocator = await this.actor.page.locator(
            `//div[@class = "vc-nav-container"]/div[@class="vc-nav-items"]//span[contains(text(),'${splitDate[0]}')]`
          )
          await yearLocator.click()
          break
        }
        await this.nextSpanYearLocator.click()
      }
    }

    await this.selectExpiryMonth(splitDate[0], splitDate[1])
    await this.selectExpiryDay(dayMonthYear)
  }

  async isPublicLinkCreated(): Promise<void> {
    await expect(this.publicLinkLocator).toBeVisible()
  }

  async fillThePublicLinkForm({
    name,
    password,
    role,
    dateOfExpiration
  }: {
    name: string
    password: string
    role: string
    dateOfExpiration: string
  }): Promise<void> {
    await this.publicLinkNameLocator.fill(name)
    await this.selectRole(role)
    await this.selectDate(dateOfExpiration)
    await this.publicLinkPasswordLocator.fill(password)
  }

  async publicLinkResource({
    folder,
    name,
    role,
    dateOfExpiration,
    password,
    via
  }: {
    folder: string
    name: string
    role: string
    dateOfExpiration: string
    password: string
    via: 'SIDEBAR_PANEL' | 'QUICK_ACTION'
  }): Promise<void> {
    // check if the provided date is valid or not
    this.isValidDate(dateOfExpiration)
    const { page } = this.actor
    const folderPaths = folder.split('/')
    const folderName = folderPaths.pop()
    if (folderPaths.length) {
      await filesCta.navigateToFolder({ page: page, path: folderPaths.join('/') })
    }

    switch (via) {
      case 'QUICK_ACTION':
        await page
          .locator(
            `//*[@data-test-resource-name="${folderName}"]/ancestor::tr//button[contains(@class, "files-quick-action-collaborators")]`
          )
          .click()
        break

      case 'SIDEBAR_PANEL':
        await filesCta.sidebar.open({ page: page, resource: folderName })
        await filesCta.sidebar.openPanel({ page: page, name: 'links' })
        break
    }
    await this.publicLinkButtonLocator.click()
    await this.fillThePublicLinkForm({ name, password, role, dateOfExpiration })
    await this.createLinkButtonLocator.click()
  }
}
