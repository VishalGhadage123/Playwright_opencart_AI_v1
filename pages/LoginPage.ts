import { Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

  // Locators
  private readonly emailField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;
  private readonly registerContinueLink: Locator;
  private readonly warningMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.emailField = page.getByLabel('E-Mail Address');
    this.passwordField = page.getByLabel('Password', { exact: true });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.registerContinueLink = page.getByRole('link', { name: 'Continue', exact: true });
    this.warningMessage = page.locator('.alert-danger');
  }

  /**
   * Verifies that the login page is displayed.
   * @returns Promise<boolean> - Whether the returning-customer section is visible
   */
  async isLoginPageExists(): Promise<boolean> {
    return this.page.getByRole('heading', { name: 'Returning Customer' }).isVisible();
  }

  /**
   * Enters credentials and submits the login form.
   * @param email - Customer email address
   * @param password - Customer password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }

  /**
   * Opens registration from the new-customer section of the login page.
   */
  async clickRegisterContinue(): Promise<void> {
    await this.registerContinueLink.click();
  }

  /**
   * Reads the current login warning text.
   * @returns Promise<string> - Warning text
   */
  async getWarningText(): Promise<string> {
    return (await this.warningMessage.innerText()).trim();
  }
}
