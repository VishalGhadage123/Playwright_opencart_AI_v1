import dotenv from 'dotenv';
import { test as base, expect } from '@playwright/test';
import { AdminCustomersPage } from '../pages/AdminCustomersPage';
import { AccountPage } from '../pages/AccountPage';
import { CartPage } from '../pages/CartPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { LogoutPage } from '../pages/LogoutPage';
import { ProductPage } from '../pages/ProductPage';
import { RegisterPage } from '../pages/RegisterPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';

dotenv.config();

const appUrl = process.env.WEB_APP_URL;

if (!appUrl) {
  throw new Error('WEB_APP_URL must be set in the environment.');
}

type PageFixtures = {
  adminCustomersPage: AdminCustomersPage;
  accountPage: AccountPage;
  cartPage: CartPage;
  homePage: HomePage;
  loginPage: LoginPage;
  logoutPage: LogoutPage;
  productPage: ProductPage;
  registerPage: RegisterPage;
  searchResultsPage: SearchResultsPage;
};

export const test = base.extend<PageFixtures>({
  adminCustomersPage: async ({ page }, use) => {
    await use(new AdminCustomersPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  homePage: async ({ page }, use) => {
    await page.goto(appUrl);
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  logoutPage: async ({ page }, use) => {
    await use(new LogoutPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
});

test.afterEach(async ({ page, context }) => {
  if (!page.isClosed()) {
    await page.close();
  }
  await context.close();
});

export { expect };
