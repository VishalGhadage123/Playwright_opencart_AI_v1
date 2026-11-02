import { join } from 'node:path';
import dotenv from 'dotenv';
import Ajv from 'ajv';
import { expect, test } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

type User = {
  id: number;
  email: string;
  username: string;
  password: string;
  name: { firstname: string; lastname: string };
  address: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
    geolocation: { lat: string; long: string };
  };
  phone: string;
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
const userId = requiredNumber('USER_ID');
const resultLimit = requiredNumber('LIMIT');
const userSchema = DataProvider.readJson(join(__dirname, '../../api/schemas/user_api_schema.json'));

test.describe('FakeStore Users API Tests', () => {
  test('GET - All users @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${baseUrl}${Routes.GET_ALL_USERS}`);
    expect(response.status(), 'Fetching users should return HTTP 200').toBe(200);

    const users = (await response.json()) as User[];
    expect(Array.isArray(users), 'The users response should be an array').toBe(true);
    expect(users.length, 'At least one user should be returned').toBeGreaterThan(0);
  });

  test('GET - User by ID @master @sanity @api', async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace('{id}', String(userId));
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'Fetching a user should return HTTP 200').toBe(200);

    const user = (await response.json()) as User;
    expect(user.id, 'The response should identify the requested user').toBe(userId);
  });

  test('GET - Users with limit @master @regression @api', async ({ request }) => {
    const route = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(resultLimit));
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'The limited user request should return HTTP 200').toBe(200);

    const users = (await response.json()) as User[];
    expect(Array.isArray(users), 'The limited user response should be an array').toBe(true);
    expect(users, 'The response should contain the requested number of users').toHaveLength(
      resultLimit,
    );
  });

  for (const order of ['asc', 'desc'] as const) {
    test(`GET - Users sorted ${order} @master @regression @api`, async ({ request }) => {
      const route = Routes.GET_USERS_SORTED.replace('{order}', order);
      const response = await request.get(`${baseUrl}${route}`);
      expect(response.status(), `The ${order} user request should return HTTP 200`).toBe(200);

      const users = (await response.json()) as User[];
      const ids = users.map((user) => user.id);
      const sortedIds = [...ids].sort((first, second) =>
        order === 'asc' ? first - second : second - first,
      );
      expect(ids, `User IDs should be in ${order}ending order`).toEqual(sortedIds);
    });
  }

  test('POST - Create user @master @regression @api', async ({ request }) => {
    const user = RandomDataUtil.generateUserPayload();
    const response = await request.post(`${baseUrl}${Routes.CREATE_USER}`, { data: user });
    expect(response.status(), 'Creating a user should return HTTP 201').toBe(201);

    const createdUser = (await response.json()) as User;
    expect(createdUser.id, 'The created user should have a numeric ID').toEqual(
      expect.any(Number),
    );
  });

  test('PUT - Update user @master @regression @api', async ({ request }) => {
    const user = RandomDataUtil.generateUserUpdatePayload();
    const route = Routes.UPDATE_USER.replace('{id}', String(userId));
    const response = await request.put(`${baseUrl}${route}`, { data: user });
    expect(response.status(), 'Updating a user should return HTTP 200').toBe(200);

    const updatedUser = (await response.json()) as User;
    expect(updatedUser.email).toBe(user.email);
    expect(updatedUser.username).toBe(user.username);
    expect(updatedUser.name).toEqual(user.name);
    expect(updatedUser.phone).toBe(user.phone);
  });

  test('DELETE - User @master @regression @api', async ({ request }) => {
    const route = Routes.DELETE_USER.replace('{id}', String(userId));
    const response = await request.delete(`${baseUrl}${route}`);
    expect(response.status(), 'Deleting a user should return HTTP 200').toBe(200);

    const deletedUser = (await response.json()) as User;
    expect(deletedUser.id, 'The delete response should identify the deleted user').toBe(userId);
  });

  test('GET - User response schema @master @regression @api', async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace('{id}', String(userId));
    const response = await request.get(`${baseUrl}${route}`);
    expect(response.status(), 'Fetching a user for schema validation should return HTTP 200').toBe(
      200,
    );

    const user = await response.json();
    const ajv = new Ajv();
    const validate = ajv.compile(userSchema);
    const isValid = validate(user);
    expect(isValid, `User schema validation failed: ${ajv.errorsText(validate.errors)}`).toBe(true);
  });

  test.describe.serial('User CRUD workflow @master @regression @api', () => {
    test('POST, PUT, DELETE - User workflow @master @regression @api', async ({ request }) => {
      const user = RandomDataUtil.generateUserPayload();
      const createResponse = await request.post(`${baseUrl}${Routes.CREATE_USER}`, { data: user });
      expect(createResponse.status(), 'Creating a workflow user should return HTTP 201').toBe(201);
      const createdUser = (await createResponse.json()) as User;
      expect(createdUser.id, 'The create response should contain the new user ID').toEqual(
        expect.any(Number),
      );

      const updatedUser = RandomDataUtil.generateUserUpdatePayload();
      const updateRoute = Routes.UPDATE_USER.replace('{id}', String(createdUser.id));
      const updateResponse = await request.put(`${baseUrl}${updateRoute}`, {
        data: updatedUser,
      });
      expect(updateResponse.status(), 'Updating the workflow user should return HTTP 200').toBe(200);
      const updateBody = (await updateResponse.json()) as User;
      expect(updateBody.email).toBe(updatedUser.email);
      expect(updateBody.username).toBe(updatedUser.username);
      expect(updateBody.name).toEqual(updatedUser.name);

      const deleteRoute = Routes.DELETE_USER.replace('{id}', String(createdUser.id));
      const deleteResponse = await request.delete(`${baseUrl}${deleteRoute}`);
      expect(deleteResponse.status(), 'Deleting the workflow user should return HTTP 200').toBe(200);
      const deleteBody = (await deleteResponse.text()).trim();
      if (deleteBody && deleteBody !== 'null') {
        const deletedUser = JSON.parse(deleteBody) as { id?: number };
        expect(deletedUser.id).toBe(createdUser.id);
      }
    });
  });
});
