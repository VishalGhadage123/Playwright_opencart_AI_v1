# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\opencart.spec.ts >> Product can be added to the cart with the requested quantity @master @sanity @regression @web
- Location: tests\web\opencart.spec.ts:146:5

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('link', { name: 'shopping cart' }) resolved to 2 elements:
    1) <a title="Shopping Cart" href="http://localhost/opencart/upload/index.php?route=checkout/cart">…</a> aka getByRole('link', { name: ' Shopping Cart' })
    2) <a href="http://localhost/opencart/upload/index.php?route=checkout/cart">shopping cart</a> aka getByRole('link', { name: 'shopping cart', exact: true })

Call log:
  - waiting for getByRole('link', { name: 'shopping cart' })

```

# Test source

```ts
  1  | import { Locator, Page } from '@playwright/test';
  2  | 
  3  | export class ProductPage {
  4  |   private readonly page: Page;
  5  | 
  6  |   // Locators
  7  |   private readonly productHeading: Locator;
  8  |   private readonly productPrice: Locator;
  9  |   private readonly quantityField: Locator;
  10 |   private readonly addToCartButton: Locator;
  11 |   private readonly addToCartMessage: Locator;
  12 |   private readonly shoppingCartConfirmationLink: Locator;
  13 | 
  14 |   constructor(page: Page) {
  15 |     this.page = page;
  16 | 
  17 |     // Initialize locators with CSS selectors
  18 |     this.productHeading = page.getByRole('heading', { level: 1 });
  19 |     this.productPrice = page.getByRole('heading', { name: /^\$\d/ });
  20 |     this.quantityField = page.getByRole('textbox', { name: 'Qty' });
  21 |     this.addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
  22 |     this.addToCartMessage = page.getByText('Success: You have added', { exact: false });
  23 |     this.shoppingCartConfirmationLink = page.getByRole('link', { name: 'shopping cart' });
  24 |   }
  25 | 
  26 |   /**
  27 |    * Verifies that product details are displayed.
  28 |    * @returns Promise<boolean> - Whether the product heading is visible
  29 |    */
  30 |   async isProductPageExists(): Promise<boolean> {
  31 |     return this.productHeading.isVisible();
  32 |   }
  33 | 
  34 |   /**
  35 |    * Reads the displayed product name.
  36 |    * @returns Promise<string> - Product heading
  37 |    */
  38 |   async getProductName(): Promise<string> {
  39 |     return (await this.productHeading.innerText()).trim();
  40 |   }
  41 | 
  42 |   /**
  43 |    * Reads the displayed product price.
  44 |    * @returns Promise<string> - Product price heading
  45 |    */
  46 |   async getProductPrice(): Promise<string> {
  47 |     return (await this.productPrice.innerText()).trim();
  48 |   }
  49 | 
  50 |   /**
  51 |    * Sets the requested product quantity.
  52 |    * @param quantity - Quantity to add to the cart
  53 |    */
  54 |   async setQuantity(quantity: string): Promise<void> {
  55 |     await this.quantityField.fill(quantity);
  56 |   }
  57 | 
  58 |   /**
  59 |    * Adds the product to the shopping cart.
  60 |    */
  61 |   async addToCart(): Promise<void> {
  62 |     await this.addToCartButton.click();
  63 |   }
  64 | 
  65 |   /**
  66 |    * Checks whether the add-to-cart confirmation is visible.
  67 |    * @returns Promise<boolean> - Whether the confirmation is visible
  68 |    */
  69 |   async isAddToCartMessageVisible(): Promise<boolean> {
  70 |     return this.addToCartMessage.isVisible();
  71 |   }
  72 | 
  73 |   /**
  74 |    * Opens the cart from the add-to-cart confirmation.
  75 |    */
  76 |   async clickShoppingCartConfirmation(): Promise<void> {
> 77 |     await this.shoppingCartConfirmationLink.click();
     |                                             ^ Error: locator.click: Error: strict mode violation: getByRole('link', { name: 'shopping cart' }) resolved to 2 elements:
  78 |   }
  79 | }
  80 | 
```