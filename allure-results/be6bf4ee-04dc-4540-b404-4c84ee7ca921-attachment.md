# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\opencart.spec.ts >> Valid customer login reaches My Account @master @sanity @regression @web
- Location: tests\web\opencart.spec.ts:58:5

# Error details

```
Error: expect(received).toBeTruthy()

Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Test source

```ts
  1   | import { join } from 'node:path';
  2   | import { test, expect } from '../../fixtures/pageFixtures';
  3   | import { DataProvider } from '../../utils/DataReader';
  4   | import { RandomDataUtil } from '../../utils/dataGenerator';
  5   | import { Helper } from '../../utils/helper';
  6   | 
  7   | type LoginTestData = {
  8   |   testName: string;
  9   |   email: string;
  10  |   password: string;
  11  |   expected: 'success' | 'failure';
  12  | };
  13  | 
  14  | const loginTestData = DataProvider.readJson(
  15  |   join(__dirname, '../../testdata/opencart_logindata.json'),
  16  | ) as LoginTestData[];
  17  | 
  18  | function createCustomer() {
  19  |   const password = RandomDataUtil.getPassword(12);
  20  | 
  21  |   return {
  22  |     firstName: RandomDataUtil.getFirstName(),
  23  |     lastName: RandomDataUtil.getLastName(),
  24  |     email: `opencart-${Date.now()}-${RandomDataUtil.getNumber()}@example.com`,
  25  |     telephone: RandomDataUtil.getPhoneNumber(),
  26  |     password,
  27  |   };
  28  | }
  29  | 
  30  | test('Customer registration succeeds @master @sanity @regression @web', async ({
  31  |   homePage,
  32  |   loginPage,
  33  |   registerPage,
  34  |   accountPage,
  35  | }) => {
  36  |   const customer = createCustomer();
  37  | 
  38  |   await test.step('1) Navigate to My Account and open registration', async () => {
  39  |     await homePage.clickMyAccount();
  40  |     await homePage.clickLogin();
  41  |     expect(await loginPage.isLoginPageExists()).toBeTruthy();
  42  |     await loginPage.clickRegisterContinue();
  43  |     expect(await registerPage.isRegisterPageExists()).toBeTruthy();
  44  |   });
  45  | 
  46  |   await test.step('2) Submit a unique customer registration', async () => {
  47  |     await registerPage.registerCustomer(customer);
  48  |     await expect.poll(() => accountPage.isAccountCreated()).toBeTruthy();
  49  |   });
  50  | 
  51  |   await test.step('3) Verify account navigation is available', async () => {
  52  |     await expect.poll(() => accountPage.isLogoutLinkVisible()).toBeTruthy();
  53  |   });
  54  | 
  55  |   console.log('✅ Customer registration completed.');
  56  | });
  57  | 
  58  | test('Valid customer login reaches My Account @master @sanity @regression @web', async ({
  59  |   homePage,
  60  |   loginPage,
  61  |   accountPage,
  62  | }) => {
  63  |   const { email, password } = Helper.getLoginDetails();
  64  | 
  65  |   await test.step('1) Navigate to the login page', async () => {
  66  |     await homePage.clickMyAccount();
  67  |     await homePage.clickLogin();
  68  |     expect(await loginPage.isLoginPageExists()).toBeTruthy();
  69  |   });
  70  | 
  71  |   await test.step('2) Log in with configured customer credentials', async () => {
  72  |     await loginPage.login(email, password);
> 73  |     await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
      |                                                                ^ Error: expect(received).toBeTruthy()
  74  |   });
  75  | 
  76  |   console.log('✅ Customer login completed.');
  77  | });
  78  | 
  79  | test('Invalid customer login is rejected @master @sanity @regression @web', async ({
  80  |   homePage,
  81  |   loginPage,
  82  |   accountPage,
  83  | }) => {
  84  |   await test.step('1) Navigate to the login page', async () => {
  85  |     await homePage.clickMyAccount();
  86  |     await homePage.clickLogin();
  87  |     expect(await loginPage.isLoginPageExists()).toBeTruthy();
  88  |   });
  89  | 
  90  |   await test.step('2) Submit invalid credentials', async () => {
  91  |     await loginPage.login(RandomDataUtil.getEmail(), RandomDataUtil.getPassword());
  92  |   });
  93  | 
  94  |   await test.step('3) Verify the warning and unauthenticated state', async () => {
  95  |     await expect
  96  |       .poll(() => loginPage.getWarningText())
  97  |       .toContain('Warning: No match for E-Mail Address and/or Password.');
  98  |     expect(await accountPage.isLogoutLinkVisible()).toBeFalsy();
  99  |   });
  100 | 
  101 |   console.log('✅ Invalid customer login was rejected.');
  102 | });
  103 | 
  104 | test('Customer logout removes authenticated navigation @master @sanity @regression @web', async ({
  105 |   homePage,
  106 |   loginPage,
  107 |   registerPage,
  108 |   accountPage,
  109 |   logoutPage,
  110 | }) => {
  111 |   const customer = createCustomer();
  112 | 
  113 |   await test.step('1) Register a customer for the logout scenario', async () => {
  114 |     await homePage.clickMyAccount();
  115 |     await homePage.clickLogin();
  116 |     await loginPage.clickRegisterContinue();
  117 |     await registerPage.registerCustomer(customer);
  118 |     await expect.poll(() => accountPage.isAccountCreated()).toBeTruthy();
  119 |   });
  120 | 
  121 |   await test.step('2) Log out and log in with the new customer', async () => {
  122 |     await accountPage.clickLogout();
  123 |     await logoutPage.clickContinue();
  124 |     await homePage.clickMyAccount();
  125 |     await homePage.clickLogin();
  126 |     await loginPage.login(customer.email, customer.password);
  127 |     await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
  128 |   });
  129 | 
  130 |   await test.step('3) Log out and verify the confirmation page', async () => {
  131 |     await accountPage.clickLogout();
  132 |     expect(await logoutPage.isLogoutPageExists()).toBeTruthy();
  133 |   });
  134 | 
  135 |   await test.step('4) Continue to the storefront and verify logout', async () => {
  136 |     await logoutPage.clickContinue();
  137 |     expect(await accountPage.isLogoutLinkVisible()).toBeFalsy();
  138 |   });
  139 | 
  140 |   console.log('✅ Customer logout completed.');
  141 | });
  142 | 
  143 | test('Product search displays the matching product @master @sanity @regression @web', async ({
  144 |   homePage,
  145 |   searchResultsPage,
  146 | }) => {
  147 |   const { productName } = Helper.getProductDetails();
  148 | 
  149 |   await test.step('1) Search for the configured product', async () => {
  150 |     await homePage.searchForProduct(productName);
  151 |   });
  152 | 
  153 |   await test.step('2) Verify the exact product appears in the results', async () => {
  154 |     expect(await searchResultsPage.isSearchResultsPageExists()).toBeTruthy();
  155 |     expect(await searchResultsPage.isProductVisible(productName)).toBeTruthy();
  156 |   });
  157 | 
  158 |   console.log('✅ Product search completed.');
  159 | });
  160 | 
  161 | test('Product can be added to the cart with the requested quantity @master @sanity @regression @web', async ({
  162 |   homePage,
  163 |   searchResultsPage,
  164 |   productPage,
  165 |   cartPage,
  166 | }) => {
  167 |   const { productName, productQuantity, totalPrice } = Helper.getProductDetails();
  168 | 
  169 |   await test.step('1) Search for and open the configured product', async () => {
  170 |     await homePage.searchForProduct(productName);
  171 |     await searchResultsPage.clickProduct(productName);
  172 |     expect(await productPage.isProductPageExists()).toBeTruthy();
  173 |     expect(await productPage.getProductName()).toBe(productName);
```