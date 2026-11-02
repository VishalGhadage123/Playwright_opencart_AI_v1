import { Locator, Page } from '@playwright/test';

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly accountLink: Locator;
  private readonly loginLink: Locator;
  private readonly searchField: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.accountLink = page.getByRole('link', { name: 'My Account' }).first();
    this.loginLink = page.getByRole('link', { name: 'Login', exact: true });
    this.searchField = page.getByRole('textbox', { name: 'Search' });
  }

  /**
   * Opens the account area.
   */
  async clickMyAccount(): Promise<void> {
    await this.accountLink.click();
  }

  /**
   * Opens the customer login page from the account menu.
   */
  async clickLogin(): Promise<void> {
    await this.loginLink.click();
  }

  /**
   * Searches the storefront for a product.
   * @param productName - Product name to search for
   */
  async searchForProduct(productName: string): Promise<void> {
    await this.searchField.fill(productName);
    await this.searchField.press('Enter');
  }
}
