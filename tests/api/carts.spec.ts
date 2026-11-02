import { join } from 'node:path';
import dotenv from 'dotenv';
import Ajv from 'ajv';
import { expect, test } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

type Cart = {
  id: number;
  userId: number;
  date: string;
  products: { productId: number; quantity: number }[];
};

function requiredNumber(name: string): number {
  const value = process.env[name];
  const parsedValue = Number(value);
  if (!value || !Number.isFinite(parsedValue)) {
    throw new Error(`${name} must be configured as a number in .env.`);
  }
  return parsedValue;
}

const baseUrl = process.env.API_BASE_URL || Routes.BASE_URL;
const cartId = requiredNumber('CART_ID');
const userId = requiredNumber('USER_ID');
const resultLimit = requiredNumber('LIMIT');
const startDate = process.env.START_DATE;
const endDate = process.env.END_DATE;
if (!startDate || !endDate) {
  throw new Error('START_DATE and END_DATE must be configured in .env.');
}
const cartSchema = DataProvider.readJson(join(__dirname, '../../api/schemas/cart_api_schema.json'));

test.describe('FakeStore Carts API Tests', () => {
  test('GET - All carts @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${baseUrl}${Routes.GET_ALL_CARTS}`);
    expect(response.status(), 'Fetching carts should return HTTP 200').toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts), 'The carts response should be an array').toBe(true);
    expect(carts.length, 'At least one cart should be returned').toBeGreaterThan(0);
  });

  test('GET - Cart by ID @master @sanity @api', async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace('{id}', String(cartId));
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'Fetching a cart should return HTTP 200').toBe(200);

    const cart = (await response.json()) as Cart;
    expect(cart.id, 'The response should identify the requested cart').toBe(cartId);
  });

  test('GET - Carts by date range @master @regression @api', async ({ request }) => {
    const route = Routes.GET_CARTS_BY_DATE_RANGE
      .replace('{startdate}', encodeURIComponent(startDate))
      .replace('{enddate}', encodeURIComponent(endDate));
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'The cart date-range request should return HTTP 200').toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts), 'The date-range response should be an array').toBe(true);
    const rangeStart = Date.parse(startDate);
    const rangeEnd = Date.parse(endDate);
    expect(Number.isNaN(rangeStart) || Number.isNaN(rangeEnd), 'Configured dates should be valid').toBe(
      false,
    );
    for (const cart of carts) {
      const cartDate = Date.parse(cart.date);
      expect(cartDate, 'Each cart should contain a parseable date').not.toBeNaN();
      expect(cartDate, 'Each cart should not precede the requested start date').toBeGreaterThanOrEqual(
        rangeStart,
      );
      expect(cartDate, 'Each cart should not exceed the requested end date').toBeLessThanOrEqual(
        rangeEnd + 24 * 60 * 60 * 1000 - 1,
      );
    }
  });

  test('GET - Carts for a user @master @regression @api', async ({ request }) => {
    const route = Routes.GET_USER_CART.replace('{userId}', String(userId));
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'Fetching a user cart should return HTTP 200').toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts), 'The user cart response should be an array').toBe(true);
    for (const cart of carts) {
      expect(cart.userId, 'Each cart should belong to the requested user').toBe(userId);
    }
  });

  test('GET - Carts with limit @master @regression @api', async ({ request }) => {
    const route = Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(resultLimit));
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'The limited cart request should return HTTP 200').toBe(200);

    const carts = (await response.json()) as Cart[];
    expect(Array.isArray(carts), 'The limited cart response should be an array').toBe(true);
    expect(carts, 'The response should contain the requested number of carts').toHaveLength(
      resultLimit,
    );
  });

  for (const order of ['asc', 'desc'] as const) {
    test(`GET - Carts sorted ${order} @master @regression @api`, async ({ request }) => {
      const route = Routes.GET_CARTS_SORTED.replace('{order}', order);
      const response = await request.get(`${baseUrl}${route}`);
      expect(response.status(), `The ${order} cart request should return HTTP 200`).toBe(200);

      const carts = (await response.json()) as Cart[];
      const ids = carts.map((cart) => cart.id);
      const sortedIds = [...ids].sort((first, second) =>
        order === 'asc' ? first - second : second - first,
      );
      expect(ids, `Cart IDs should be in ${order}ending order`).toEqual(sortedIds);
    });
  }

  test('POST - Create cart @master @regression @api', async ({ request }) => {
    const cart = RandomDataUtil.generateCartPayload(userId);
    const response = await request.post(`${baseUrl}${Routes.CREATE_CART}`, { data: cart });
    expect(response.status(), 'Creating a cart should return HTTP 201').toBe(201);

    const createdCart = (await response.json()) as Cart;
    expect(createdCart.id, 'The created cart should have a numeric ID').toEqual(
      expect.any(Number),
    );
    expect(createdCart.userId).toBe(cart.userId);
    expect(createdCart.products).toEqual(cart.products);
  });

  test('PUT - Update cart @master @regression @api', async ({ request }) => {
    const cart = RandomDataUtil.generateUpdatedCartPayload(userId);
    const route = Routes.UPDATE_CART.replace('{id}', String(cartId));
    const response = await request.put(`${baseUrl}${route}`, { data: cart });
    expect(response.status(), 'Updating a cart should return HTTP 200').toBe(200);

    const updatedCart = (await response.json()) as Cart;
    expect(updatedCart.id).toBe(cartId);
    expect(updatedCart.userId).toBe(cart.userId);
    expect(updatedCart.products).toEqual(cart.products);
  });

  test('DELETE - Cart @master @regression @api', async ({ request }) => {
    const route = Routes.DELETE_CART.replace('{id}', String(cartId));
    const response = await request.delete(`${baseUrl}${route}`);
    expect(response.status(), 'Deleting a cart should return HTTP 200').toBe(200);

    const responseBody = (await response.text()).trim();
    if (responseBody && responseBody !== 'null') {
      const deletedCart = JSON.parse(responseBody) as { id?: number };
      expect(deletedCart.id, 'The delete response should identify the deleted cart').toBe(cartId);
    }
  });

  test('GET - Cart response schema @master @regression @api', async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace('{id}', String(cartId));
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'Fetching a cart for schema validation should return HTTP 200').toBe(
      200,
    );
    const cart = await response.json();
    const ajv = new Ajv();
    const validate = ajv.compile(cartSchema);
    const isValid = validate(cart);
    expect(isValid, `Cart schema validation failed: ${ajv.errorsText(validate.errors)}`).toBe(true);
  });

  test.describe.serial('Cart CRUD workflow @master @regression @api', () => {
    test('POST, PUT, DELETE - Cart workflow @master @regression @api', async ({ request }) => {
      const cart = RandomDataUtil.generateCartPayload(userId);
      const createResponse = await request.post(`${baseUrl}${Routes.CREATE_CART}`, { data: cart });
      expect(createResponse.status(), 'Creating a workflow cart should return HTTP 201').toBe(201);
      const createdCart = (await createResponse.json()) as Cart;
      expect(createdCart.id, 'The create response should contain the new cart ID').toEqual(
        expect.any(Number),
      );
      expect(createdCart.userId).toBe(cart.userId);
      expect(createdCart.products).toEqual(cart.products);

      const updatedCart = RandomDataUtil.generateUpdatedCartPayload(createdCart.userId);
      updatedCart.products[0].productId = createdCart.products[0].productId;
      updatedCart.products[0].quantity = createdCart.products[0].quantity + 1;
      const updateRoute = Routes.UPDATE_CART.replace('{id}', String(createdCart.id));
      const updateResponse = await request.put(`${baseUrl}${updateRoute}`, {
        data: updatedCart,
      });
      expect(updateResponse.status(), 'Updating the workflow cart should return HTTP 200').toBe(200);
      const updateBody = (await updateResponse.json()) as Cart;
      expect(updateBody.id).toBe(createdCart.id);
      expect(updateBody.userId).toBe(createdCart.userId);
      expect(updateBody.products).toEqual(updatedCart.products);

      const deleteRoute = Routes.DELETE_CART.replace('{id}', String(createdCart.id));
      const deleteResponse = await request.delete(`${baseUrl}${deleteRoute}`);
      expect(deleteResponse.status(), 'Deleting the workflow cart should return HTTP 200').toBe(200);
      const deleteBody = (await deleteResponse.text()).trim();
      if (deleteBody && deleteBody !== 'null') {
        const deletedCart = JSON.parse(deleteBody) as { id?: number };
        expect(deletedCart.id).toBe(createdCart.id);
      }
    });
  });
});
