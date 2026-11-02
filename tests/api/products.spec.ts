import { join } from 'node:path';
import dotenv from 'dotenv';
import Ajv from 'ajv';
import { expect, test } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
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
const productId = requiredNumber('PRODUCT_ID');
const resultLimit = requiredNumber('LIMIT');
const productSchema = DataProvider.readJson(
  join(__dirname, '../../api/schemas/product_api_schema.json'),
);

test.describe('FakeStore Products API Tests', () => {
  test('GET - All products @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${baseUrl}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status(), 'Fetching products should return HTTP 200').toBe(200);

    const products = (await response.json()) as Product[];
    expect(Array.isArray(products), 'The products response should be an array').toBe(true);
    expect(products.length, 'At least one product should be returned').toBeGreaterThan(0);

    for (const product of products) {
      expect(product.id, 'Each product should have a numeric ID').toEqual(expect.any(Number));
      expect(product.title, 'Each product should have a title').toEqual(expect.any(String));
      expect(product.price, 'Each product should have a numeric price').toEqual(expect.any(Number));
      expect(product.category, 'Each product should have a category').toEqual(expect.any(String));
      expect(product.image, 'Each product should have an image URL').toEqual(expect.any(String));
    }
  });

  test('GET - Product by ID @master @sanity @api', async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(productId));
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'Fetching a product should return HTTP 200').toBe(200);

    const product = (await response.json()) as Product;
    expect(product.id, 'The response should identify the requested product').toBe(productId);
    expect(product.title).toEqual(expect.any(String));
    expect(product.price).toEqual(expect.any(Number));
    expect(product.category).toEqual(expect.any(String));
    expect(product.image).toEqual(expect.any(String));
  });

  test('GET - Products with limit @master @regression @api', async ({ request }) => {
    const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(resultLimit));
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'The limited product request should return HTTP 200').toBe(200);

    const products = (await response.json()) as Product[];
    expect(Array.isArray(products), 'The limited product response should be an array').toBe(true);
    expect(products, 'The response should contain the requested number of products').toHaveLength(
      resultLimit,
    );
  });

  for (const order of ['asc', 'desc'] as const) {
    test(`GET - Products sorted ${order} @master @regression @api`, async ({ request }) => {
      const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', order);
      const response = await request.get(`${baseUrl}${route}`);
      expect(response.status(), `The ${order} product request should return HTTP 200`).toBe(200);

      const products = (await response.json()) as Product[];
      const ids = products.map((product) => product.id);
      const sortedIds = [...ids].sort((first, second) =>
        order === 'asc' ? first - second : second - first,
      );
      expect(ids, `Product IDs should be in ${order}ending order`).toEqual(sortedIds);
    });
  }

  test('GET - All product categories @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${baseUrl}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status(), 'Fetching categories should return HTTP 200').toBe(200);

    const categories = (await response.json()) as string[];
    expect(Array.isArray(categories), 'The categories response should be an array').toBe(true);
    expect(categories.length, 'At least one category should be returned').toBeGreaterThan(0);
  });

  test('GET - Products by category @master @regression @api', async ({ request }) => {
    const category = 'electronics';
    const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', category);
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'Fetching a category should return HTTP 200').toBe(200);

    const products = (await response.json()) as Product[];
    expect(Array.isArray(products), 'The category response should be an array').toBe(true);
    expect(products.length, 'The category should contain at least one product').toBeGreaterThan(0);
    for (const product of products) {
      expect(product.category, 'Every result should belong to the requested category').toBe(
        category,
      );
    }
  });

  test('POST - Create product @master @regression @api', async ({ request }) => {
    const product = RandomDataUtil.generateProductPayload();
    const response = await request.post(`${baseUrl}${Routes.CREATE_PRODUCT}`, { data: product });
    expect(response.status(), 'Creating a product should return HTTP 201').toBe(201);

    const createdProduct = (await response.json()) as Product;
    expect(createdProduct.id, 'The created product should have a numeric ID').toEqual(
      expect.any(Number),
    );
    expect(createdProduct.title).toBe(product.title);
    expect(createdProduct.price).toBe(product.price);
    expect(createdProduct.description).toBe(product.description);
    expect(createdProduct.category).toBe(product.category);
    expect(createdProduct.image).toBe(product.image);
  });

  test('PUT - Update product @master @regression @api', async ({ request }) => {
    const product = RandomDataUtil.generateUpdatedProductPayload();
    const route = Routes.UPDATE_PRODUCT.replace('{id}', String(productId));
    const response = await request.put(`${baseUrl}${route}`, { data: product });
    expect(response.status(), 'Updating a product should return HTTP 200').toBe(200);

    const updatedProduct = (await response.json()) as Product;
    expect(updatedProduct.id).toBe(productId);
    expect(updatedProduct.title).toBe(product.title);
    expect(updatedProduct.price).toBe(product.price);
    expect(updatedProduct.description).toBe(product.description);
    expect(updatedProduct.category).toBe(product.category);
    expect(updatedProduct.image).toBe(product.image);
  });

  test('DELETE - Product @master @regression @api', async ({ request }) => {
    const route = Routes.DELETE_PRODUCT.replace('{id}', String(productId));
    const response = await request.delete(`${baseUrl}${route}`);
    expect(response.status(), 'Deleting a product should return HTTP 200').toBe(200);

    const responseBody = (await response.text()).trim();
    if (responseBody && responseBody !== 'null') {
      const deletedProduct = JSON.parse(responseBody) as { id?: number };
      expect(deletedProduct.id, 'The delete response should identify the deleted product').toBe(
        productId,
      );
    }
  });

  test('GET - Product response schema @master @regression @api', async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(productId));
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'Fetching a product for schema validation should return HTTP 200').toBe(
      200,
    );
    const product = await response.json();
    const ajv = new Ajv();
    const validate = ajv.compile(productSchema);
    const isValid = validate(product);
    expect(isValid, `Product schema validation failed: ${ajv.errorsText(validate.errors)}`).toBe(true);
  });

  test.describe.serial('Product CRUD workflow @master @regression @api', () => {
    test('POST, PUT, DELETE - Product workflow @master @regression @api', async ({ request }) => {
      const product = RandomDataUtil.generateProductPayload();
      const createResponse = await request.post(`${baseUrl}${Routes.CREATE_PRODUCT}`, {
        data: product,
      });
      expect(createResponse.status(), 'Creating a workflow product should return HTTP 201').toBe(
        201,
      );
      const createdProduct = (await createResponse.json()) as Product;
      expect(createdProduct.id, 'The create response should contain the new product ID').toEqual(
        expect.any(Number),
      );

      const updatedProduct = RandomDataUtil.generateUpdatedProductPayload();
      const updateRoute = Routes.UPDATE_PRODUCT.replace('{id}', String(createdProduct.id));
      const updateResponse = await request.put(`${baseUrl}${updateRoute}`, {
        data: updatedProduct,
      });
      expect(updateResponse.status(), 'Updating the workflow product should return HTTP 200').toBe(
        200,
      );
      const updateBody = (await updateResponse.json()) as Product;
      expect(updateBody.id).toBe(createdProduct.id);
      expect(updateBody.title).toBe(updatedProduct.title);
      expect(updateBody.price).toBe(updatedProduct.price);

      const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(createdProduct.id));
      const deleteResponse = await request.delete(`${baseUrl}${deleteRoute}`);
      expect(deleteResponse.status(), 'Deleting the workflow product should return HTTP 200').toBe(
        200,
      );
      const deleteBody = (await deleteResponse.text()).trim();
      if (deleteBody && deleteBody !== 'null') {
        const deletedProduct = JSON.parse(deleteBody) as { id?: number };
        expect(deletedProduct.id).toBe(createdProduct.id);
      }
    });
  });
});
