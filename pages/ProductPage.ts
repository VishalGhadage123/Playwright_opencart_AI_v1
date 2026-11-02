import { Locator, Page } from '@playwright/test';

export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly productHeading: Locator;
  private readonly productPrice: Locator;
  private readonly quantityField: Locator;
  private readonly addToCartButton: Locator;
  private readonly addToCartMessage: Locator;
  private readonly shoppingCartConfirmationLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.productHeading = page.getByRole('heading', { level: 1 });
    this.productPrice = page.getByRole('heading', { name: /^\$\d/ });
    this.quantityField = page.getByRole('textbox', { name: 'Qty' });
    this.addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    this.addToCartMessage = page.getByText('Success: You have added', { exact: false });
    this.shoppingCartConfirmationLink = page.getByRole('link', {
      name: 'shopping cart',
      exact: true,
    });
  }

  /**
   * Verifies that product details are displayed.
   * @returns Promise<boolean> - Whether the product heading is visible
   */
  async isProductPageExists(): Promise<boolean> {
    return this.productHeading.isVisible();
  }

  /**
   * Reads the displayed product name.
   * @returns Promise<string> - Product heading
   */
  async getProductName(): Promise<string> {
    return (await this.productHeading.innerText()).trim();
  }

  /**
   * Reads the displayed product price.
   * @returns Promise<string> - Product price heading
   */
  async getProductPrice(): Promise<string> {
    return (await this.productPrice.innerText()).trim();
  }

  /**
   * Sets the requested product quantity.
   * @param quantity - Quantity to add to the cart
   */
  async setQuantity(quantity: string): Promise<void> {
    await this.quantityField.fill(quantity);
  }

  /**
   * Adds the product to the shopping cart.
   */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  /**
   * Checks whether the add-to-cart confirmation is visible.
   * @returns Promise<boolean> - Whether the confirmation is visible
   */
  async isAddToCartMessageVisible(): Promise<boolean> {
    return this.addToCartMessage.isVisible();
  }

  /**
   * Opens the cart from the add-to-cart confirmation.
   */
  async clickShoppingCartConfirmation(): Promise<void> {
    await this.shoppingCartConfirmationLink.click();
  }
}
