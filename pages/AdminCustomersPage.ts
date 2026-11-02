import { Locator, Page } from '@playwright/test';

export class AdminCustomersPage {
  private readonly page: Page;
  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;
  private readonly emailFilter: Locator;
  private readonly filterButton: Locator;
  private readonly customerRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameField = page.getByLabel('Username');
    this.passwordField = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: /Login/ });
    this.emailFilter = page.locator('#input-email');
    this.filterButton = page.locator('#button-filter');
    this.customerRows = page.locator('#form-customer tbody tr');
  }

  async openLoginPage(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
    await this.page.waitForURL(/route=common\/dashboard/);
  }

  async openCustomerList(): Promise<void> {
    const dashboardUrl = new URL(this.page.url());
    if (!dashboardUrl.searchParams.has('user_token')) {
      throw new Error('Admin dashboard URL does not contain a user token.');
    }

    dashboardUrl.searchParams.set('route', 'customer/customer');
    await this.page.goto(dashboardUrl.toString());
    await this.page.getByRole('heading', { name: 'Customer List' }).waitFor();
  }

  async searchByEmail(email: string): Promise<void> {
    await this.emailFilter.fill(email);
    await this.filterButton.click();
  }

  getCustomerRows(email: string): Locator {
    return this.customerRows.filter({ hasText: email });
  }
}
