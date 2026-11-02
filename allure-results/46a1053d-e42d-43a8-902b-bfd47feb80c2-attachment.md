# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\opencart.spec.ts >> Customer registration succeeds @master @sanity @regression @web
- Location: tests\web\opencart.spec.ts:30:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.isVisible: Target page, context or browser has been closed
Call log:
    - checking visibility of getByRole('heading', { name: 'Register Account' })

```

# Test source

```ts
  1  | import { Locator, Page } from '@playwright/test';
  2  | 
  3  | export type CustomerRegistration = {
  4  |   firstName: string;
  5  |   lastName: string;
  6  |   email: string;
  7  |   telephone: string;
  8  |   password: string;
  9  | };
  10 | 
  11 | export class RegisterPage {
  12 |   private readonly page: Page;
  13 | 
  14 |   // Locators
  15 |   private readonly firstNameField: Locator;
  16 |   private readonly lastNameField: Locator;
  17 |   private readonly emailField: Locator;
  18 |   private readonly telephoneField: Locator;
  19 |   private readonly passwordField: Locator;
  20 |   private readonly passwordConfirmField: Locator;
  21 |   private readonly privacyPolicyCheckbox: Locator;
  22 |   private readonly continueButton: Locator;
  23 | 
  24 |   constructor(page: Page) {
  25 |     this.page = page;
  26 | 
  27 |     // Initialize locators with CSS selectors
  28 |     this.firstNameField = page.getByLabel('First Name');
  29 |     this.lastNameField = page.getByLabel('Last Name');
  30 |     this.emailField = page.getByLabel('E-Mail');
  31 |     this.telephoneField = page.getByLabel('Telephone');
  32 |     this.passwordField = page.getByPlaceholder('Password', { exact: true });
  33 |     this.passwordConfirmField = page.getByPlaceholder('Password Confirm', { exact: true });
  34 |     this.privacyPolicyCheckbox = page.getByRole('checkbox');
  35 |     this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
  36 |   }
  37 | 
  38 |   /**
  39 |    * Verifies that the registration page is displayed.
  40 |    * @returns Promise<boolean> - Whether the registration heading is visible
  41 |    */
  42 |   async isRegisterPageExists(): Promise<boolean> {
> 43 |     return this.page.getByRole('heading', { name: 'Register Account' }).isVisible();
     |                                                                         ^ Error: locator.isVisible: Target page, context or browser has been closed
  44 |   }
  45 | 
  46 |   /**
  47 |    * Completes and submits the customer registration form.
  48 |    * @param customer - Customer registration values
  49 |    */
  50 |   async registerCustomer(customer: CustomerRegistration): Promise<void> {
  51 |     await this.firstNameField.fill(customer.firstName);
  52 |     await this.lastNameField.fill(customer.lastName);
  53 |     await this.emailField.fill(customer.email);
  54 |     await this.telephoneField.fill(customer.telephone);
  55 |     await this.passwordField.fill(customer.password);
  56 |     await this.passwordConfirmField.fill(customer.password);
  57 |     await this.privacyPolicyCheckbox.check();
  58 |     await this.continueButton.click();
  59 |   }
  60 | }
  61 | 
```