import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { test, expect } from '../../fixtures/pageFixtures';
import type { CustomerRegistration } from '../../pages/RegisterPage';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { executeQuery } from '../../utils/dbClient';

dotenv.config();

const adminUrl =
  process.env.ADMIN_APP_URL ??
  'http://localhost/opencart/upload/admin/index.php';
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminUsername || !adminPassword) {
  throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in the environment.');
}

test('A registered customer is available in Admin and MySQL @master @regression @db @end-to-end', async ({
  homePage,
  loginPage,
  registerPage,
  accountPage,
  adminCustomersPage,
}) => {
  const customer: CustomerRegistration = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: `opencart-${randomUUID()}@example.com`,
    telephone: RandomDataUtil.getPhoneNumber(),
    password: RandomDataUtil.getPassword(12),
  };
  const expectedAdminStatus = 'Enabled';
  const expectedDatabaseStatus = 1;

  try {
    await test.step('Register the customer through the storefront', async () => {
      await homePage.clickMyAccount();
      await homePage.clickLogin();
      expect(await loginPage.isLoginPageExists()).toBeTruthy();
      await loginPage.clickRegisterContinue();
      expect(await registerPage.isRegisterPageExists()).toBeTruthy();
      await registerPage.registerCustomer(customer);
      await expect.poll(() => accountPage.isAccountCreated()).toBeTruthy();
    });

    await test.step('Find and verify the customer in the Admin Portal', async () => {
      await adminCustomersPage.openLoginPage(adminUrl);
      await adminCustomersPage.login(adminUsername, adminPassword);
      await adminCustomersPage.openCustomerList();
      await adminCustomersPage.searchByEmail(customer.email);

      const customerRows = adminCustomersPage.getCustomerRows(customer.email);
      await expect(
        customerRows,
        'Expected exactly one Admin customer row for the registered email.',
      ).toHaveCount(1);
      const customerCells = customerRows.first().locator('td');

      await expect(customerCells.nth(1)).toHaveText(
        `${customer.firstName} ${customer.lastName}`,
      );
      await expect(customerCells.nth(2)).toHaveText(customer.email);
      await expect(customerCells.nth(4)).toHaveText(expectedAdminStatus);
    });

    await test.step('Find and verify the customer in MySQL', async () => {
      const schema = await executeQuery<RowDataPacket[]>(
        'SHOW COLUMNS FROM oc_customer',
      );
      const columns = new Set(schema.map((column) => String(column.Field)));
      const requiredColumns = ['firstname', 'lastname', 'email', 'status'];

      for (const column of requiredColumns) {
        expect(columns.has(column), `oc_customer is missing the ${column} column.`)
          .toBeTruthy();
      }

      const hasDateAdded = columns.has('date_added');
      const selectedColumns = [
        ...requiredColumns,
        ...(hasDateAdded ? ['date_added'] : []),
      ].join(', ');
      const customers = await executeQuery<RowDataPacket[]>(
        `SELECT ${selectedColumns} FROM oc_customer WHERE email = ?`,
        [customer.email],
      );

      expect(
        customers,
        'Expected exactly one MySQL customer row for the registered email.',
      ).toHaveLength(1);
      const databaseCustomer = customers[0];

      expect(databaseCustomer.firstname, 'Database first name mismatch.')
        .toBe(customer.firstName);
      expect(databaseCustomer.lastname, 'Database last name mismatch.')
        .toBe(customer.lastName);
      expect(databaseCustomer.email, 'Database email mismatch.')
        .toBe(customer.email);
      expect(Number(databaseCustomer.status), 'Database customer status mismatch.')
        .toBe(expectedDatabaseStatus);

      if (hasDateAdded) {
        expect(databaseCustomer.date_added, 'Database date_added is missing.')
          .toBeTruthy();
      }
    });
  } finally {
    await executeQuery<ResultSetHeader>(
      'DELETE FROM oc_customer WHERE email = ?',
      [customer.email],
    );
  }
});
