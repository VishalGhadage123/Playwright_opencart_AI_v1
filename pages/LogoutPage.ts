import { Locator, Page } from '@playwright/test';

export class LogoutPage {
  private readonly page: Page;

  // Locators
  private readonly logoutHeading: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.logoutHeading = page.getByRole('heading', { name: 'Account Logout' });
    this.continueButton = page.getByRole('link', { name: 'Continue', exact: true });
  }

  /**
   * Verifies that the logout confirmation page is displayed.
   * @returns Promise<boolean> - Whether the confirmation heading is visible
   */
  async isLogoutPageExists(): Promise<boolean> {
    return this.logoutHeading.isVisible();
  }

  /**
   * Continues from the logout confirmation to the storefront.
   */
  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }
}
