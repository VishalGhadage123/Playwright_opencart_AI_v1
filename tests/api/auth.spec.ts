import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import dotenv from 'dotenv';
import { expect, test } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';

const envPath = join(__dirname, '../../.env');
const projectEnv = dotenv.parse(readFileSync(envPath));
dotenv.config({ path: envPath });

const baseUrl = process.env.API_BASE_URL || Routes.BASE_URL;
const username =
  process.env.API_USERNAME || projectEnv.USERNAME || process.env.USERNAME;
const password =
  process.env.API_PASSWORD || projectEnv.PASSWORD || process.env.PASSWORD;

test.describe('FakeStore Authentication API Tests', () => {
  test('POST - Login with valid credentials @master @sanity @api', async ({ request }) => {
    expect(username, 'Configure a valid FakeStore username in .env').toBeTruthy();
    expect(password, 'Configure a valid FakeStore password in .env').toBeTruthy();

    const response = await request.post(`${baseUrl}${Routes.AUTH_LOGIN}`, {
      data: { username, password },
    });

    expect(response.status(), 'Successful login should return HTTP 201').toBe(201);

    const body = (await response.json()) as { token?: unknown };
    if (typeof body.token !== 'string') {
      throw new Error('The login response should contain a token string.');
    }
    expect(body.token.length, 'The returned token should not be empty').toBeGreaterThan(0);
  });

  test('POST - Login with invalid credentials @master @regression @api', async ({ request }) => {
    const credentials = RandomDataUtil.generateInvalidLoginPayload();
    const response = await request.post(`${baseUrl}${Routes.AUTH_LOGIN}`, {
      data: credentials,
    });

    expect(response.status(), 'Invalid credentials should return HTTP 401').toBe(401);

    const message = await response.text();
    expect(message, 'The API should explain why authentication failed').toBe(
      'username or password is incorrect',
    );
  });
});
