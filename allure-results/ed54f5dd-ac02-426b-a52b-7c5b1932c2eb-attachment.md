# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\opencart.spec.ts >> Valid login (success) row 1 @master @regression @datadriven @web
- Location: tests\web\opencart.spec.ts:246:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Test source

```ts
  166 | }) => {
  167 |   const { productName, productQuantity, totalPrice } = Helper.getProductDetails();
  168 | 
  169 |   await test.step('1) Search for and open the configured product', async () => {
  170 |     await homePage.searchForProduct(productName);
  171 |     await searchResultsPage.clickProduct(productName);
  172 |     expect(await productPage.isProductPageExists()).toBeTruthy();
  173 |     expect(await productPage.getProductName()).toBe(productName);
  174 |   });
  175 | 
  176 |   await test.step('2) Add the product to the cart', async () => {
  177 |     await productPage.setQuantity(productQuantity);
  178 |     await productPage.addToCart();
  179 |     await expect.poll(() => productPage.isAddToCartMessageVisible()).toBeTruthy();
  180 |   });
  181 | 
  182 |   await test.step('3) Verify product, quantity, and price in the cart', async () => {
  183 |     await productPage.clickShoppingCartConfirmation();
  184 |     expect(await cartPage.isCartPageExists()).toBeTruthy();
  185 |     await expect
  186 |       .poll(() => cartPage.getProductQuantity(productName))
  187 |       .toBe(productQuantity);
  188 |     expect(await cartPage.getProductRowText(productName)).toContain(totalPrice);
  189 |   });
  190 | 
  191 |   console.log('✅ Product was added to the cart.');
  192 | });
  193 | 
  194 | test('End-to-end customer shopping journey @master @regression @end-to-end @web', async ({
  195 |   homePage,
  196 |   loginPage,
  197 |   registerPage,
  198 |   accountPage,
  199 |   logoutPage,
  200 |   searchResultsPage,
  201 |   productPage,
  202 |   cartPage,
  203 | }) => {
  204 |   const customer = createCustomer();
  205 |   const { productName, productQuantity, totalPrice } = Helper.getProductDetails();
  206 | 
  207 |   await test.step('1) Register a new customer', async () => {
  208 |     await homePage.clickMyAccount();
  209 |     await homePage.clickLogin();
  210 |     await loginPage.clickRegisterContinue();
  211 |     await registerPage.registerCustomer(customer);
  212 |     await expect.poll(() => accountPage.isAccountCreated()).toBeTruthy();
  213 |   });
  214 | 
  215 |   await test.step('2) Log out and log back in with the new account', async () => {
  216 |     await accountPage.clickLogout();
  217 |     await logoutPage.clickContinue();
  218 |     await homePage.clickMyAccount();
  219 |     await homePage.clickLogin();
  220 |     await loginPage.login(customer.email, customer.password);
  221 |     await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
  222 |   });
  223 | 
  224 |   await test.step('3) Search for the product and add it to the cart', async () => {
  225 |     await homePage.searchForProduct(productName);
  226 |     await searchResultsPage.clickProduct(productName);
  227 |     expect(await productPage.isProductPageExists()).toBeTruthy();
  228 |     await productPage.setQuantity(productQuantity);
  229 |     await productPage.addToCart();
  230 |     await expect.poll(() => productPage.isAddToCartMessageVisible()).toBeTruthy();
  231 |   });
  232 | 
  233 |   await test.step('4) Verify the cart product, quantity, price, and total', async () => {
  234 |     await productPage.clickShoppingCartConfirmation();
  235 |     expect(await cartPage.isCartPageExists()).toBeTruthy();
  236 |     expect(await cartPage.getProductQuantity(productName)).toBe(productQuantity);
  237 |     const productRow = await cartPage.getProductRowText(productName);
  238 |     expect(productRow).toContain(totalPrice);
  239 |     expect(await cartPage.getCartTotalText()).toContain(totalPrice);
  240 |   });
  241 | 
  242 |   console.log('✅ End-to-end customer shopping journey completed.');
  243 | });
  244 | 
  245 | for (const [index, row] of loginTestData.entries()) {
  246 |   test(`${row.testName} (${row.expected}) row ${index + 1} @master @regression @datadriven @web`, async ({
  247 |     homePage,
  248 |     loginPage,
  249 |     accountPage,
  250 |   }) => {
  251 |     const email = row.email.trim() ? row.email : '';
  252 |     const password = row.password.trim() ? row.password : '';
  253 | 
  254 |     await test.step('1) Open the OpenCart login page', async () => {
  255 |       await homePage.clickMyAccount();
  256 |       await homePage.clickLogin();
  257 |       expect(await loginPage.isLoginPageExists()).toBeTruthy();
  258 |     });
  259 | 
  260 |     await test.step('2) Submit the external test-data credentials', async () => {
  261 |       await loginPage.login(email, password);
  262 |     });
  263 | 
  264 |     await test.step('3) Validate the result against the data row', async () => {
  265 |       if (row.expected === 'success') {
> 266 |         await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
      |                                                                    ^ Error: expect(received).toBeTruthy()
  267 |       } else {
  268 |         await expect
  269 |           .poll(() => loginPage.getWarningText())
  270 |           .toMatch(/^Warning: .+/);
  271 |         expect(await accountPage.isLogoutLinkVisible()).toBeFalsy();
  272 |       }
  273 |     });
  274 | 
  275 |     console.log(`✅ Data-driven login scenario completed: ${row.testName}.`);
  276 |   });
  277 | }
  278 | 
```