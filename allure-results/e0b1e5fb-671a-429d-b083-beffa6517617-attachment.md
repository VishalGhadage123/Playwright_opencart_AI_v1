# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\opencart.spec.ts >> Valid customer login reaches My Account @master @sanity @regression @web
- Location: tests\web\opencart.spec.ts:57:5

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
  40  |     expect(await loginPage.isLoginPageExists()).toBeTruthy();
  41  |     await loginPage.clickRegisterContinue();
  42  |     expect(await registerPage.isRegisterPageExists()).toBeTruthy();
  43  |   });
  44  | 
  45  |   await test.step('2) Submit a unique customer registration', async () => {
  46  |     await registerPage.registerCustomer(customer);
  47  |     await expect.poll(() => accountPage.isAccountCreated()).toBeTruthy();
  48  |   });
  49  | 
  50  |   await test.step('3) Verify account navigation is available', async () => {
  51  |     await expect.poll(() => accountPage.isLogoutLinkVisible()).toBeTruthy();
  52  |   });
  53  | 
  54  |   console.log('✅ Customer registration completed.');
  55  | });
  56  | 
  57  | test('Valid customer login reaches My Account @master @sanity @regression @web', async ({
  58  |   homePage,
  59  |   loginPage,
  60  |   accountPage,
  61  | }) => {
  62  |   const { email, password } = Helper.getLoginDetails();
  63  | 
  64  |   await test.step('1) Navigate to the login page', async () => {
  65  |     await homePage.clickMyAccount();
> 66  |     expect(await loginPage.isLoginPageExists()).toBeTruthy();
      |                                                 ^ Error: expect(received).toBeTruthy()
  67  |   });
  68  | 
  69  |   await test.step('2) Log in with configured customer credentials', async () => {
  70  |     await loginPage.login(email, password);
  71  |     await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
  72  |   });
  73  | 
  74  |   console.log('✅ Customer login completed.');
  75  | });
  76  | 
  77  | test('Invalid customer login is rejected @master @sanity @regression @web', async ({
  78  |   homePage,
  79  |   loginPage,
  80  |   accountPage,
  81  | }) => {
  82  |   await test.step('1) Navigate to the login page', async () => {
  83  |     await homePage.clickMyAccount();
  84  |     expect(await loginPage.isLoginPageExists()).toBeTruthy();
  85  |   });
  86  | 
  87  |   await test.step('2) Submit invalid credentials', async () => {
  88  |     await loginPage.login(RandomDataUtil.getEmail(), RandomDataUtil.getPassword());
  89  |   });
  90  | 
  91  |   await test.step('3) Verify the warning and unauthenticated state', async () => {
  92  |     await expect
  93  |       .poll(() => loginPage.getWarningText())
  94  |       .toContain('Warning: No match for E-Mail Address and/or Password.');
  95  |     expect(await accountPage.isLogoutLinkVisible()).toBeFalsy();
  96  |   });
  97  | 
  98  |   console.log('✅ Invalid customer login was rejected.');
  99  | });
  100 | 
  101 | test('Customer logout removes authenticated navigation @master @sanity @regression @web', async ({
  102 |   homePage,
  103 |   loginPage,
  104 |   accountPage,
  105 |   logoutPage,
  106 | }) => {
  107 |   const { email, password } = Helper.getLoginDetails();
  108 | 
  109 |   await test.step('1) Log in with configured customer credentials', async () => {
  110 |     await homePage.clickMyAccount();
  111 |     await loginPage.login(email, password);
  112 |     await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
  113 |   });
  114 | 
  115 |   await test.step('2) Log out and verify the confirmation page', async () => {
  116 |     await accountPage.clickLogout();
  117 |     expect(await logoutPage.isLogoutPageExists()).toBeTruthy();
  118 |   });
  119 | 
  120 |   await test.step('3) Continue to the storefront and verify logout', async () => {
  121 |     await logoutPage.clickContinue();
  122 |     expect(await accountPage.isLogoutLinkVisible()).toBeFalsy();
  123 |   });
  124 | 
  125 |   console.log('✅ Customer logout completed.');
  126 | });
  127 | 
  128 | test('Product search displays the matching product @master @sanity @regression @web', async ({
  129 |   homePage,
  130 |   searchResultsPage,
  131 | }) => {
  132 |   const { productName } = Helper.getProductDetails();
  133 | 
  134 |   await test.step('1) Search for the configured product', async () => {
  135 |     await homePage.searchForProduct(productName);
  136 |   });
  137 | 
  138 |   await test.step('2) Verify the exact product appears in the results', async () => {
  139 |     expect(await searchResultsPage.isSearchResultsPageExists()).toBeTruthy();
  140 |     expect(await searchResultsPage.isProductVisible(productName)).toBeTruthy();
  141 |   });
  142 | 
  143 |   console.log('✅ Product search completed.');
  144 | });
  145 | 
  146 | test('Product can be added to the cart with the requested quantity @master @sanity @regression @web', async ({
  147 |   homePage,
  148 |   searchResultsPage,
  149 |   productPage,
  150 |   cartPage,
  151 | }) => {
  152 |   const { productName, productQuantity, totalPrice } = Helper.getProductDetails();
  153 | 
  154 |   await test.step('1) Search for and open the configured product', async () => {
  155 |     await homePage.searchForProduct(productName);
  156 |     await searchResultsPage.clickProduct(productName);
  157 |     expect(await productPage.isProductPageExists()).toBeTruthy();
  158 |     expect(await productPage.getProductName()).toBe(productName);
  159 |   });
  160 | 
  161 |   await test.step('2) Add the product to the cart', async () => {
  162 |     await productPage.setQuantity(productQuantity);
  163 |     await productPage.addToCart();
  164 |     await expect.poll(() => productPage.isAddToCartMessageVisible()).toBeTruthy();
  165 |   });
  166 | 
```