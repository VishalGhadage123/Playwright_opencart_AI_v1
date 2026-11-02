# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\opencart.spec.ts >> Customer logout removes authenticated navigation @master @sanity @regression @web
- Location: tests\web\opencart.spec.ts:104:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('link', { name: 'Logout', exact: true }).first()

```

# Test source

```ts
  1  | import { Locator, Page } from '@playwright/test';
  2  | 
  3  | export class AccountPage {
  4  |   private readonly page: Page;
  5  | 
  6  |   // Locators
  7  |   private readonly accountHeading: Locator;
  8  |   private readonly logoutLink: Locator;
  9  |   private readonly accountCreatedHeading: Locator;
  10 | 
  11 |   constructor(page: Page) {
  12 |     this.page = page;
  13 | 
  14 |     // Initialize locators with CSS selectors
  15 |     this.accountHeading = page.getByRole('heading', { name: 'My Account', exact: true });
  16 |     this.logoutLink = page.getByRole('link', { name: 'Logout', exact: true });
  17 |     this.accountCreatedHeading = page.getByRole('heading', {
  18 |       name: 'Your Account Has Been Created!',
  19 |       exact: true,
  20 |     });
  21 |   }
  22 | 
  23 |   /**
  24 |    * Verifies that the customer account dashboard is displayed.
  25 |    * @returns Promise<boolean> - Whether the dashboard heading is visible
  26 |    */
  27 |   async isAccountPageExists(): Promise<boolean> {
  28 |     return this.accountHeading.isVisible();
  29 |   }
  30 | 
  31 |   /**
  32 |    * Verifies that OpenCart displayed the account-created confirmation.
  33 |    * @returns Promise<boolean> - Whether the confirmation heading is visible
  34 |    */
  35 |   async isAccountCreated(): Promise<boolean> {
  36 |     return this.accountCreatedHeading.isVisible();
  37 |   }
  38 | 
  39 |   /**
  40 |    * Opens the account logout confirmation page.
  41 |    */
  42 |   async clickLogout(): Promise<void> {
> 43 |     await this.logoutLink.first().click();
     |                                   ^ Error: locator.click: Target page, context or browser has been closed
  44 |   }
  45 | 
  46 |   /**
  47 |    * Checks whether an authenticated logout option is visible.
  48 |    * @returns Promise<boolean> - Whether the logout option is visible
  49 |    */
  50 |   async isLogoutLinkVisible(): Promise<boolean> {
  51 |     return this.logoutLink.first().isVisible();
  52 |   }
  53 | }
  54 | 
```