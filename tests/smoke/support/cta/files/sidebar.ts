import { Page } from 'playwright'

export const open = async ({ page, resource }: { page: Page; resource: string }): Promise<void> => {
  await page.click(
    `//span[@data-test-resource-name="${resource}"]/ancestor::tr[contains(@class, "oc-tbody-tr")]//button[contains(@class, "resource-table-btn-action-dropdown")]`
  )
  await page.waitForSelector('//*[@id="oc-files-context-menu"]')
  await page.click('.oc-files-actions-show-details-trigger')
}

export const close = async ({ page }: { page: Page }): Promise<void> => {
  await page.click('.sidebar-panel.is-active-sub-panel .header__close')
}

export const openPanel = async ({
  page,
  name
}: {
  page: Page
  name: 'actions' | 'sharing' | 'links' | 'versions' | 'details'
}): Promise<void> => {
  await page.waitForSelector('//*[@id="sidebar-panel-details-item"]')
  // const backElement = await page.$('.sidebar-panel.is-active .header__back')
  // if (backElement) {
  //   await backElement.click()
  // }

  try {
    const backElement = await page.waitForSelector('.sidebar-panel.is-active .header__back', {timeout: 500})
    await backElement.click()
  } catch (error) {
    
  }

  // const panelOpenElement = await page.$(`#sidebar-panel-${name}-item-select`)
  // if (panelOpenElement) {
  //   await panelOpenElement.click()
  // }

  try {
    const panelOpenElement = await page.waitForSelector(`#sidebar-panel-${name}-item-select`, {timeout: 500})
    await panelOpenElement.click()
  } catch (error) {
    
  }
}
