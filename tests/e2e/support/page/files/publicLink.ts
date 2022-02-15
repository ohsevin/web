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
  private readonly monthAndYearDropdownLocator: Locator
  private dateType: string
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
    this.monthAndYearDropdownLocator = this.actor.page.locator(`//div[@class = 'vc-title']`)
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

  isValidDate = (date: string): boolean => {
    const dateParsed = new Date(date)
    return dateParsed instanceof Date && !isNaN(dateParsed.valueOf())
  }

  checkDaysType = (stringDate: string): string => {
    if (stringDate.includes('year')) {
      return 'year'
    } else if (stringDate.includes('month')) {
      return 'month'
    } else if (stringDate.includes('week')) {
      return 'week'
    } else {
      return 'day'
    }
  }

  checkDateType = (expiryDate: string): string => {
    // validation for days
    if (expiryDate.charAt(0).includes('-')) {
      throw new Error('The Provided date is negative and has already expired !!')
    } else if (expiryDate.charAt(0).includes('+')) {
      return this.checkDaysType(expiryDate)
    }
    // validation for actual date format
    const parsedDate = new Date(expiryDate)
    if (this.isValidDate(expiryDate)) {
      if (
        new Date().toDateString() !== parsedDate.toDateString() &&
        new Date().getTime() - parsedDate.getTime() > 0
      ) {
        throw new Error('The Provided date is Already Expired !!')
      }
    } else {
      throw new Error('The Provided date is invalid !!')
    }
  }

  addMonth = (months: number): Date => {
    const date = new Date()
    date.setMonth(date.getMonth() + months)
    return date
  }

  daysBetweenMonths = (startDate: Date, endDate: Date): number => {
    const diff = Math.abs(startDate.getTime() - endDate.getTime())
    return Math.ceil(diff / (1000 * 3600 * 24))
  }

  dateWithMonth = (noOfMonths: number): Date => {
    const date = new Date()
    date.setMonth(date.getMonth() + noOfMonths)
    return date
  }

  addDays = (date: Date, days: number): Date => {
    date.setDate(date.getDate() + days)
    return date
  }

  async selectDate(dataOfExpiration: string): Promise<void> {
    let newExpiryDate
    // await this.actor.page.pause()
    if (this.dateType === 'day') {
      newExpiryDate = this.addDays(new Date(), parseInt(dataOfExpiration))
    } else if (this.dateType === 'week') {
      newExpiryDate = this.addDays(new Date(), parseInt(dataOfExpiration) * 7)
    } else if (this.dateType === 'month') {
      const dateAterMonth = this.dateWithMonth(parseInt(dataOfExpiration))
      const daysBetweenMonths = this.daysBetweenMonths(new Date(), dateAterMonth)
      newExpiryDate = this.addDays(new Date(), daysBetweenMonths)
    } else if (this.dateType === 'year') {
      const dateAterYear = this.dateWithMonth(parseInt(dataOfExpiration) * 12)
      const daysBetweenYear = this.daysBetweenMonths(new Date(), dateAterYear)
      newExpiryDate = this.addDays(new Date(), daysBetweenYear)
    }
    // console.log(newExpiryDate)
    const expiryDay = newExpiryDate.getDate()
    const expiryMonth = ('0' + (newExpiryDate.getMonth() + 1)).slice(-2)
    const expiryYear = newExpiryDate.getFullYear().toString()
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
    // const expiryDate = new Date(dataOfExpiration)
    const dayMonthYear =
      days[newExpiryDate.getDay()] +
      ', ' +
      months[newExpiryDate.getMonth()] +
      ' ' +
      expiryDay +
      ', ' +
      expiryYear
    // console.log(dayMonthYear)
    await this.monthAndYearDropdownLocator.click()
    if ((await this.yearButtonLocator.innerText()) !== expiryYear) {
      await this.yearButtonLocator.click()
      while (true) {
        const nextYearSpanValue = await this.yearButtonLocator.innerText()
        const splitNextSpanYear = nextYearSpanValue.split('-')
        if (
          newExpiryDate.getFullYear() >= parseInt(splitNextSpanYear[0]) &&
          newExpiryDate.getFullYear() <= parseInt(splitNextSpanYear[1])
        ) {
          const yearLocator = await this.actor.page.locator(
            `//div[@class = "vc-nav-container"]/div[@class="vc-nav-items"]//span[contains(text(),'${expiryYear}')]`
          )
          await yearLocator.click()
          break
        }
        await this.nextSpanYearLocator.click()
      }
    }

    await this.selectExpiryMonth(expiryYear, expiryMonth)
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
    // also check if the provided date is valid or not
    this.dateType = this.checkDateType(dateOfExpiration)
    // console.log(this.dateType)
    // date or days check
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