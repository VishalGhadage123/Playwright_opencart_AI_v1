import { Locator, Page } from '@playwright/test';

export class AccountPage {
  private readonly page: Page;

  // Locators
  private readonly accountHeading: Locator;
  private readonly logoutLink: Locator;
  private readonly accountCreatedHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.accountHeading = page
      .locator('#content')
      .getByRole('heading', { name: 'My Account', exact: true });
    this.logoutLink = page.getByRole('link', { name: 'Logout', exact: true });
    this.accountCreatedHeading = page.getByRole('heading', {
      name: 'Your Account Has Been Created!',
      exact: true,
    });
  }

  /**
   * Verifies that the customer account dashboard is displayed.
   * @returns Promise<boolean> - Whether the dashboard heading is visible
   */
  async isAccountPageExists(): Promise<boolean> {
    return this.accountHeading.isVisible();
  }

  /**
   * Verifies that OpenCart displayed the account-created confirmation.
   * @returns Promise<boolean> - Whether the confirmation heading is visible
   */
  async isAccountCreated(): Promise<boolean> {
    return this.accountCreatedHeading.isVisible();
  }

  /**
   * Opens the account logout confirmation page.
   */
  async clickLogout(): Promise<void> {
    await this.logoutLink.first().click();
  }

  /**
   * Checks whether an authenticated logout option is visible.
   * @returns Promise<boolean> - Whether the logout option is visible
   */
  async isLogoutLinkVisible(): Promise<boolean> {
    return this.logoutLink.first().isVisible();
  }
}
