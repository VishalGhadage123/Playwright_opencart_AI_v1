# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\opencart.spec.ts >> Invalid login (failure) row 5 @master @regression @datadriven @web
- Location: tests\web\opencart.spec.ts:229:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
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
  167 |   await test.step('3) Verify product, quantity, and price in the cart', async () => {
  168 |     await productPage.clickShoppingCartConfirmation();
  169 |     expect(await cartPage.isCartPageExists()).toBeTruthy();
  170 |     await expect
  171 |       .poll(() => cartPage.getProductQuantity(productName))
  172 |       .toBe(productQuantity);
  173 |     expect(await cartPage.getProductRowText(productName)).toContain(totalPrice);
  174 |   });
  175 | 
  176 |   console.log('✅ Product was added to the cart.');
  177 | });
  178 | 
  179 | test('End-to-end customer shopping journey @master @regression @end-to-end @web', async ({
  180 |   homePage,
  181 |   loginPage,
  182 |   registerPage,
  183 |   accountPage,
  184 |   logoutPage,
  185 |   searchResultsPage,
  186 |   productPage,
  187 |   cartPage,
  188 | }) => {
  189 |   const customer = createCustomer();
  190 |   const { productName, productQuantity, totalPrice } = Helper.getProductDetails();
  191 | 
  192 |   await test.step('1) Register a new customer', async () => {
  193 |     await homePage.clickMyAccount();
  194 |     await loginPage.clickRegisterContinue();
  195 |     await registerPage.registerCustomer(customer);
  196 |     await expect.poll(() => accountPage.isAccountCreated()).toBeTruthy();
  197 |   });
  198 | 
  199 |   await test.step('2) Log out and log back in with the new account', async () => {
  200 |     await accountPage.clickLogout();
  201 |     await logoutPage.clickContinue();
  202 |     await homePage.clickMyAccount();
  203 |     await loginPage.login(customer.email, customer.password);
  204 |     await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
  205 |   });
  206 | 
  207 |   await test.step('3) Search for the product and add it to the cart', async () => {
  208 |     await homePage.searchForProduct(productName);
  209 |     await searchResultsPage.clickProduct(productName);
  210 |     expect(await productPage.isProductPageExists()).toBeTruthy();
  211 |     await productPage.setQuantity(productQuantity);
  212 |     await productPage.addToCart();
  213 |     await expect.poll(() => productPage.isAddToCartMessageVisible()).toBeTruthy();
  214 |   });
  215 | 
  216 |   await test.step('4) Verify the cart product, quantity, price, and total', async () => {
  217 |     await productPage.clickShoppingCartConfirmation();
  218 |     expect(await cartPage.isCartPageExists()).toBeTruthy();
  219 |     expect(await cartPage.getProductQuantity(productName)).toBe(productQuantity);
  220 |     const productRow = await cartPage.getProductRowText(productName);
  221 |     expect(productRow).toContain(totalPrice);
  222 |     expect(await cartPage.getCartTotalText()).toContain(totalPrice);
  223 |   });
  224 | 
  225 |   console.log('✅ End-to-end customer shopping journey completed.');
  226 | });
  227 | 
  228 | for (const [index, row] of loginTestData.entries()) {
  229 |   test(`${row.testName} (${row.expected}) row ${index + 1} @master @regression @datadriven @web`, async ({
  230 |     homePage,
  231 |     loginPage,
  232 |     accountPage,
  233 |   }) => {
  234 |     const email = row.email.trim() ? row.email : '';
  235 |     const password = row.password.trim() ? row.password : '';
  236 | 
  237 |     await test.step('1) Open the OpenCart login page', async () => {
  238 |       await homePage.clickMyAccount();
> 239 |       expect(await loginPage.isLoginPageExists()).toBeTruthy();
      |                                                   ^ Error: expect(received).toBeTruthy()
  240 |     });
  241 | 
  242 |     await test.step('2) Submit the external test-data credentials', async () => {
  243 |       await loginPage.login(email, password);
  244 |     });
  245 | 
  246 |     await test.step('3) Validate the result against the data row', async () => {
  247 |       if (row.expected === 'success') {
  248 |         await expect.poll(() => accountPage.isAccountPageExists()).toBeTruthy();
  249 |       } else {
  250 |         await expect
  251 |           .poll(() => loginPage.getWarningText())
  252 |           .toContain('Warning: No match for E-Mail Address and/or Password.');
  253 |         expect(await accountPage.isLogoutLinkVisible()).toBeFalsy();
  254 |       }
  255 |     });
  256 | 
  257 |     console.log(`✅ Data-driven login scenario completed: ${row.testName}.`);
  258 |   });
  259 | }
  260 | 
```