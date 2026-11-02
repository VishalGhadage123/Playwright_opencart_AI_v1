import { Locator, Page } from '@playwright/test';

export class SearchResultsPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verifies that the search results page is displayed.
   * @returns Promise<boolean> - Whether a search heading is visible
   */
  async isSearchResultsPageExists(): Promise<boolean> {
    return this.page.getByRole('heading', { name: /^Search/ }).isVisible();
  }

  /**
   * Checks whether an exact product name appears in search results.
   * @param productName - Product name to find
   * @returns Promise<boolean> - Whether the product link is visible
   */
  async isProductVisible(productName: string): Promise<boolean> {
    return this.productLink(productName).first().isVisible();
  }

  /**
   * Opens a product from the search results.
   * @param productName - Exact product name to open
   */
  async clickProduct(productName: string): Promise<void> {
    await this.productLink(productName).first().click();
  }

  private productLink(productName: string): Locator {
    return this.page.getByRole('link', { name: productName, exact: true });
  }
}
