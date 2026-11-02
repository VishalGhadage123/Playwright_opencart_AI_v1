# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\users.spec.ts >> FakeStore Users API Tests >> PUT - Update user @master @regression @api
- Location: tests\api\users.spec.ts:102:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: undefined
```

# Test source

```ts
  9   | dotenv.config();
  10  | 
  11  | type User = {
  12  |   id: number;
  13  |   email: string;
  14  |   username: string;
  15  |   password: string;
  16  |   name: { firstname: string; lastname: string };
  17  |   address: {
  18  |     city: string;
  19  |     street: string;
  20  |     number: number;
  21  |     zipcode: string;
  22  |     geolocation: { lat: string; long: string };
  23  |   };
  24  |   phone: string;
  25  | };
  26  | 
  27  | function requiredNumber(name: string): number {
  28  |   const value = process.env[name];
  29  |   const parsedValue = Number(value);
  30  |   if (!value || !Number.isFinite(parsedValue)) {
  31  |     throw new Error(`${name} must be configured as a number in .env.`);
  32  |   }
  33  |   return parsedValue;
  34  | }
  35  | 
  36  | const baseUrl = process.env.API_BASE_URL || Routes.BASE_URL;
  37  | const userId = requiredNumber('USER_ID');
  38  | const resultLimit = requiredNumber('LIMIT');
  39  | const userSchema = DataProvider.readJson(join(__dirname, '../../api/schemas/user_api_schema.json'));
  40  | 
  41  | test.describe('FakeStore Users API Tests', () => {
  42  |   test('GET - All users @master @sanity @api', async ({ request }) => {
  43  |     const response = await request.get(`${baseUrl}${Routes.GET_ALL_USERS}`);
  44  |     expect(response.status(), 'Fetching users should return HTTP 200').toBe(200);
  45  | 
  46  |     const users = (await response.json()) as User[];
  47  |     expect(Array.isArray(users), 'The users response should be an array').toBe(true);
  48  |     expect(users.length, 'At least one user should be returned').toBeGreaterThan(0);
  49  |   });
  50  | 
  51  |   test('GET - User by ID @master @sanity @api', async ({ request }) => {
  52  |     const route = Routes.GET_USER_BY_ID.replace('{id}', String(userId));
  53  |     const response = await request.get(`${baseUrl}${route}`);
  54  |     expect(response.status(), 'Fetching a user should return HTTP 200').toBe(200);
  55  | 
  56  |     const user = (await response.json()) as User;
  57  |     expect(user.id, 'The response should identify the requested user').toBe(userId);
  58  |   });
  59  | 
  60  |   test('GET - Users with limit @master @regression @api', async ({ request }) => {
  61  |     const route = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(resultLimit));
  62  |     const response = await request.get(`${baseUrl}${route}`);
  63  |     expect(response.status(), 'The limited user request should return HTTP 200').toBe(200);
  64  | 
  65  |     const users = (await response.json()) as User[];
  66  |     expect(Array.isArray(users), 'The limited user response should be an array').toBe(true);
  67  |     expect(users, 'The response should contain the requested number of users').toHaveLength(
  68  |       resultLimit,
  69  |     );
  70  |   });
  71  | 
  72  |   for (const order of ['asc', 'desc'] as const) {
  73  |     test(`GET - Users sorted ${order} @master @regression @api`, async ({ request }) => {
  74  |       const route = Routes.GET_USERS_SORTED.replace('{order}', order);
  75  |       const response = await request.get(`${baseUrl}${route}`);
  76  |       expect(response.status(), `The ${order} user request should return HTTP 200`).toBe(200);
  77  | 
  78  |       const users = (await response.json()) as User[];
  79  |       const ids = users.map((user) => user.id);
  80  |       const sortedIds = [...ids].sort((first, second) =>
  81  |         order === 'asc' ? first - second : second - first,
  82  |       );
  83  |       expect(ids, `User IDs should be in ${order}ending order`).toEqual(sortedIds);
  84  |     });
  85  |   }
  86  | 
  87  |   test('POST - Create user @master @regression @api', async ({ request }) => {
  88  |     const user = RandomDataUtil.generateUserPayload();
  89  |     const response = await request.post(`${baseUrl}${Routes.CREATE_USER}`, { data: user });
  90  |     expect(response.status(), 'Creating a user should return HTTP 201').toBe(201);
  91  | 
  92  |     const createdUser = (await response.json()) as User;
  93  |     expect(createdUser.id, 'The created user should have a numeric ID').toEqual(
  94  |       expect.any(Number),
  95  |     );
  96  |     expect(createdUser.email).toBe(user.email);
  97  |     expect(createdUser.username).toBe(user.username);
  98  |     expect(createdUser.name).toEqual(user.name);
  99  |     expect(createdUser.phone).toBe(user.phone);
  100 |   });
  101 | 
  102 |   test('PUT - Update user @master @regression @api', async ({ request }) => {
  103 |     const user = RandomDataUtil.generateUserUpdatePayload();
  104 |     const route = Routes.UPDATE_USER.replace('{id}', String(userId));
  105 |     const response = await request.put(`${baseUrl}${route}`, { data: user });
  106 |     expect(response.status(), 'Updating a user should return HTTP 200').toBe(200);
  107 | 
  108 |     const updatedUser = (await response.json()) as User;
> 109 |     expect(updatedUser.id).toBe(userId);
      |                            ^ Error: expect(received).toBe(expected) // Object.is equality
  110 |     expect(updatedUser.email).toBe(user.email);
  111 |     expect(updatedUser.username).toBe(user.username);
  112 |     expect(updatedUser.name).toEqual(user.name);
  113 |     expect(updatedUser.phone).toBe(user.phone);
  114 |   });
  115 | 
  116 |   test('DELETE - User @master @regression @api', async ({ request }) => {
  117 |     const route = Routes.DELETE_USER.replace('{id}', String(userId));
  118 |     const response = await request.delete(`${baseUrl}${route}`);
  119 |     expect(response.status(), 'Deleting a user should return HTTP 200').toBe(200);
  120 | 
  121 |     const deletedUser = (await response.json()) as User;
  122 |     expect(deletedUser.id, 'The delete response should identify the deleted user').toBe(userId);
  123 |   });
  124 | 
  125 |   test('GET - User response schema @master @regression @api', async ({ request }) => {
  126 |     const route = Routes.GET_USER_BY_ID.replace('{id}', String(userId));
  127 |     const response = await request.get(`${baseUrl}${route}`);
  128 |     expect(response.status(), 'Fetching a user for schema validation should return HTTP 200').toBe(
  129 |       200,
  130 |     );
  131 | 
  132 |     const user = await response.json();
  133 |     const validate = new Ajv().compile(userSchema);
  134 |     const isValid = validate(user);
  135 |     expect(isValid, `User schema validation failed: ${new Ajv().errorsText(validate.errors)}`).toBe(
  136 |       true,
  137 |     );
  138 |   });
  139 | 
  140 |   test.describe.serial('User CRUD workflow @master @regression @api', () => {
  141 |     test('POST, PUT, DELETE - User workflow @master @regression @api', async ({ request }) => {
  142 |       const user = RandomDataUtil.generateUserPayload();
  143 |       const createResponse = await request.post(`${baseUrl}${Routes.CREATE_USER}`, { data: user });
  144 |       expect(createResponse.status(), 'Creating a workflow user should return HTTP 201').toBe(201);
  145 |       const createdUser = (await createResponse.json()) as User;
  146 |       expect(createdUser.id, 'The create response should contain the new user ID').toEqual(
  147 |         expect.any(Number),
  148 |       );
  149 | 
  150 |       const updatedUser = RandomDataUtil.generateUserUpdatePayload();
  151 |       const updateRoute = Routes.UPDATE_USER.replace('{id}', String(createdUser.id));
  152 |       const updateResponse = await request.put(`${baseUrl}${updateRoute}`, {
  153 |         data: updatedUser,
  154 |       });
  155 |       expect(updateResponse.status(), 'Updating the workflow user should return HTTP 200').toBe(200);
  156 |       const updateBody = (await updateResponse.json()) as User;
  157 |       expect(updateBody.id).toBe(createdUser.id);
  158 |       expect(updateBody.email).toBe(updatedUser.email);
  159 |       expect(updateBody.username).toBe(updatedUser.username);
  160 |       expect(updateBody.name).toEqual(updatedUser.name);
  161 | 
  162 |       const deleteRoute = Routes.DELETE_USER.replace('{id}', String(createdUser.id));
  163 |       const deleteResponse = await request.delete(`${baseUrl}${deleteRoute}`);
  164 |       expect(deleteResponse.status(), 'Deleting the workflow user should return HTTP 200').toBe(200);
  165 |       const deleteBody = (await deleteResponse.json()) as User;
  166 |       expect(deleteBody.id).toBe(createdUser.id);
  167 |     });
  168 |   });
  169 | });
  170 | 
```