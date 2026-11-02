import { Locator, Page } from '@playwright/test';

export class CartPage {
  private readonly page: Page;

  // Locators
  private readonly cartHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.cartHeading = page.getByRole('heading', { name: /^Shopping Cart/ });
  }

  /**
   * Verifies that the shopping cart page is displayed.
   * @returns Promise<boolean> - Whether the cart heading is visible
   */
  async isCartPageExists(): Promise<boolean> {
    return this.cartHeading.isVisible();
  }

  /**
   * Reads the row for a product in the cart.
   * @param productName - Exact name of the product
   * @returns Promise<string> - Product row text
   */
  async getProductRowText(productName: string): Promise<string> {
    return this.productRow(productName).innerText();
  }

  /**
   * Reads the quantity of a product in the cart.
   * @param productName - Exact name of the product
   * @returns Promise<string> - Product quantity
   */
  async getProductQuantity(productName: string): Promise<string> {
    return this.productRow(productName).getByRole('textbox').inputValue();
  }

  /**
   * Reads the final cart total row.
   * @returns Promise<string> - Cart total row text
   */
  async getCartTotalText(): Promise<string> {
    return this.page.getByRole('row').filter({ hasText: /Total:/ }).last().innerText();
  }

  private productRow(productName: string): Locator {
    return this.page.getByRole('row').filter({ hasText: productName });
  }
}
