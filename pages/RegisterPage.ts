import { Locator, Page } from '@playwright/test';

export type CustomerRegistration = {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
};

export class RegisterPage {
  private readonly page: Page;

  // Locators
  private readonly firstNameField: Locator;
  private readonly lastNameField: Locator;
  private readonly emailField: Locator;
  private readonly telephoneField: Locator;
  private readonly passwordField: Locator;
  private readonly passwordConfirmField: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.firstNameField = page.getByLabel('First Name');
    this.lastNameField = page.getByLabel('Last Name');
    this.emailField = page.getByLabel('E-Mail');
    this.telephoneField = page.getByLabel('Telephone');
    this.passwordField = page.getByPlaceholder('Password', { exact: true });
    this.passwordConfirmField = page.getByPlaceholder('Password Confirm', { exact: true });
    this.privacyPolicyCheckbox = page.getByRole('checkbox');
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
  }

  /**
   * Verifies that the registration page is displayed.
   * @returns Promise<boolean> - Whether the registration heading is visible
   */
  async isRegisterPageExists(): Promise<boolean> {
    return this.page.getByRole('heading', { name: 'Register Account' }).isVisible();
  }

  /**
   * Completes and submits the customer registration form.
   * @param customer - Customer registration values
   */
  async registerCustomer(customer: CustomerRegistration): Promise<void> {
    await this.firstNameField.fill(customer.firstName);
    await this.lastNameField.fill(customer.lastName);
    await this.emailField.fill(customer.email);
    await this.telephoneField.fill(customer.telephone);
    await this.passwordField.fill(customer.password);
    await this.passwordConfirmField.fill(customer.password);
    await this.privacyPolicyCheckbox.check();
    await this.continueButton.click();
  }
}
