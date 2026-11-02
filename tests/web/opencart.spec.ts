import { join } from 'node:path';
import { test, expect } from '../../fixtures/pageFixtures';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

type LoginTestData = {
  testName: string;
  email: string;
  password: string;
  expected: 'success' | 'failure';
};

const loginTestData = DataProvider.readJson(
  join(__dirname, '../../testdata/opencart_logindata.json'),
) as LoginTestData[];

function createCustomer() {
  const password = RandomDataUtil.getPassword(12);

  return {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: `opencart-${Date.now()}-${RandomDataUtil.getNumber()}@example.com`,
    telephone: RandomDataUtil.getPhoneNumber(),
    password,
  };
}

test('Customer registration succeeds @master @sanity @regression @web', async ({
  homePage,
  loginPage,
  registerPage,
  accountPage,
}) => {
  const customer = createCustomer();

  await test.step('1) Navigate to My Account and open registration', async () => {
    await homePage.clickMyAccount();
    await homePage.clickLogin();
    expect(await loginPage.isLoginPageExists()).toBeTruthy();
    await loginPage.clickRegisterContinue();
    expect(await registerPage.isRegisterPageExists()).toBeTruthy();
  });

  await test.step('2) Submit a unique customer registration', async () => {
    await registerPage.registerCustomer(customer);
    await expect.poll(() => accountPage.isAccountCreated()).toBeTruthy();
  });

  await test.step('3) Verify account navigation is available', async () => {
    await expect.poll(() => accountPage.isLogoutLinkVisible()).toBeTruthy();
  });

  console.log('✅ Customer registration completed.');
});

test('Valid customer login reaches My Account @master @sanity @regression @web', async ({
  homePage,
  loginPage,
  accountPage,
}) => {
  const { email, password } = Helper.getLoginDetails();

  await test.step('1) Navigate to the login page', async () => {
    await homePage.clickMyAccount();
    await homePage.clickLogin();
    expect(await loginPage.isLoginPageExists()).toBeTruthy();
  });

  await test.step('2) Log in with configured customer credentials', async () => {
    await loginPage.login(email, password);
    await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
  });

  console.log('✅ Customer login completed.');
});

test('Invalid customer login is rejected @master @sanity @regression @web', async ({
  homePage,
  loginPage,
  accountPage,
}) => {
  await test.step('1) Navigate to the login page', async () => {
    await homePage.clickMyAccount();
    await homePage.clickLogin();
    expect(await loginPage.isLoginPageExists()).toBeTruthy();
  });

  await test.step('2) Submit invalid credentials', async () => {
    await loginPage.login(RandomDataUtil.getEmail(), RandomDataUtil.getPassword());
  });

  await test.step('3) Verify the warning and unauthenticated state', async () => {
    await expect
      .poll(() => loginPage.getWarningText())
      .toContain('Warning: No match for E-Mail Address and/or Password.');
    expect(await accountPage.isLogoutLinkVisible()).toBeFalsy();
  });

  console.log('✅ Invalid customer login was rejected.');
});

test('Customer logout removes authenticated navigation @master @sanity @regression @web', async ({
  homePage,
  loginPage,
  registerPage,
  accountPage,
  logoutPage,
}) => {
  const customer = createCustomer();

  await test.step('1) Register a customer for the logout scenario', async () => {
    await homePage.clickMyAccount();
    await homePage.clickLogin();
    await loginPage.clickRegisterContinue();
    await registerPage.registerCustomer(customer);
    await expect.poll(() => accountPage.isAccountCreated()).toBeTruthy();
  });

  await test.step('2) Log out and log in with the new customer', async () => {
    await accountPage.clickLogout();
    await logoutPage.clickContinue();
    await homePage.clickMyAccount();
    await homePage.clickLogin();
    await loginPage.login(customer.email, customer.password);
    await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
  });

  await test.step('3) Log out and verify the confirmation page', async () => {
    await accountPage.clickLogout();
    expect(await logoutPage.isLogoutPageExists()).toBeTruthy();
  });

  await test.step('4) Continue to the storefront and verify logout', async () => {
    await logoutPage.clickContinue();
    expect(await accountPage.isLogoutLinkVisible()).toBeFalsy();
  });

  console.log('✅ Customer logout completed.');
});

test('Product search displays the matching product @master @sanity @regression @web', async ({
  homePage,
  searchResultsPage,
}) => {
  const { productName } = Helper.getProductDetails();

  await test.step('1) Search for the configured product', async () => {
    await homePage.searchForProduct(productName);
  });

  await test.step('2) Verify the exact product appears in the results', async () => {
    expect(await searchResultsPage.isSearchResultsPageExists()).toBeTruthy();
    expect(await searchResultsPage.isProductVisible(productName)).toBeTruthy();
  });

  console.log('✅ Product search completed.');
});

test('Product can be added to the cart with the requested quantity @master @sanity @regression @web', async ({
  homePage,
  searchResultsPage,
  productPage,
  cartPage,
}) => {
  const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

  await test.step('1) Search for and open the configured product', async () => {
    await homePage.searchForProduct(productName);
    await searchResultsPage.clickProduct(productName);
    expect(await productPage.isProductPageExists()).toBeTruthy();
    expect(await productPage.getProductName()).toBe(productName);
  });

  await test.step('2) Add the product to the cart', async () => {
    await productPage.setQuantity(productQuantity);
    await productPage.addToCart();
    await expect.poll(() => productPage.isAddToCartMessageVisible()).toBeTruthy();
  });

  await test.step('3) Verify product, quantity, and price in the cart', async () => {
    await productPage.clickShoppingCartConfirmation();
    expect(await cartPage.isCartPageExists()).toBeTruthy();
    await expect
      .poll(() => cartPage.getProductQuantity(productName))
      .toBe(productQuantity);
    expect(await cartPage.getProductRowText(productName)).toContain(totalPrice);
  });

  console.log('✅ Product was added to the cart.');
});

test('End-to-end customer shopping journey @master @regression @end-to-end @web', async ({
  homePage,
  loginPage,
  registerPage,
  accountPage,
  logoutPage,
  searchResultsPage,
  productPage,
  cartPage,
}) => {
  const customer = createCustomer();
  const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

  await test.step('1) Register a new customer', async () => {
    await homePage.clickMyAccount();
    await homePage.clickLogin();
    await loginPage.clickRegisterContinue();
    await registerPage.registerCustomer(customer);
    await expect.poll(() => accountPage.isAccountCreated()).toBeTruthy();
  });

  await test.step('2) Log out and log back in with the new account', async () => {
    await accountPage.clickLogout();
    await logoutPage.clickContinue();
    await homePage.clickMyAccount();
    await homePage.clickLogin();
    await loginPage.login(customer.email, customer.password);
    await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
  });

  await test.step('3) Search for the product and add it to the cart', async () => {
    await homePage.searchForProduct(productName);
    await searchResultsPage.clickProduct(productName);
    expect(await productPage.isProductPageExists()).toBeTruthy();
    await productPage.setQuantity(productQuantity);
    await productPage.addToCart();
    await expect.poll(() => productPage.isAddToCartMessageVisible()).toBeTruthy();
  });

  await test.step('4) Verify the cart product, quantity, price, and total', async () => {
    await productPage.clickShoppingCartConfirmation();
    expect(await cartPage.isCartPageExists()).toBeTruthy();
    expect(await cartPage.getProductQuantity(productName)).toBe(productQuantity);
    const productRow = await cartPage.getProductRowText(productName);
    expect(productRow).toContain(totalPrice);
    expect(await cartPage.getCartTotalText()).toContain(totalPrice);
  });

  console.log('✅ End-to-end customer shopping journey completed.');
});

for (const [index, row] of loginTestData.entries()) {
  test(`${row.testName} (${row.expected}) row ${index + 1} @master @regression @datadriven @web`, async ({
    homePage,
    loginPage,
    accountPage,
  }) => {
    const email = row.email.trim() ? row.email : '';
    const password = row.password.trim() ? row.password : '';

    await test.step('1) Open the OpenCart login page', async () => {
      await homePage.clickMyAccount();
      await homePage.clickLogin();
      expect(await loginPage.isLoginPageExists()).toBeTruthy();
    });

    await test.step('2) Submit the external test-data credentials', async () => {
      await loginPage.login(email, password);
    });

    await test.step('3) Validate the result against the data row', async () => {
      if (row.expected === 'success') {
        await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
      } else {
        await expect
          .poll(() => loginPage.getWarningText())
          .toMatch(/^Warning: .+/);
        expect(await accountPage.isLogoutLinkVisible()).toBeFalsy();
      }
    });

    console.log(`✅ Data-driven login scenario completed: ${row.testName}.`);
  });
}
