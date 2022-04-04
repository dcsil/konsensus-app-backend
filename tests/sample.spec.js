const request = require('supertest');
const app = require('../src/server');

function delay() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

beforeAll(async () => {
  await delay();
});

describe('Sample test suite', () => {
  it('Sample Test', () => {
    expect(true).toEqual(true);
  });

  it('Test home endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual(
      "Welcome to Konsensus' backend! Windsor is Julian's favourite student!"
    );
  });
});

describe('Users test suite', () => {

  let organizationId;

  it('Create an organization', async () => {
    const response = await request(app)
      .post('/organization/create')
      .send({
        name: 'Facebook',
      });
    expect(response.statusCode).toBe(200);
  });

  // it('Get all organizations', async () => {
  //   const response = await request(app).get('/organization');
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body.length).toBeGreaterThan(0);
  //   organizationId = response.body[0].id;
  // });

  it('Create a user', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({
        firstName: 'Windsor',
        lastName: 'Huang',
        email: 'windsoriscool@gmail.com',
        password: '123456',
        organizationId: organizationId});
    expect(response.statusCode).toBe(200);
    console.log('response.message :>> ', response.message);
  });

  it('Login a user', async () => {
    const response = await request(app)
      .post('/user/authenticate')
      .send({
        email: 'windsoriscool@gmail.com',
        password: '123456'
      });
    expect(response.statusCode).toBe(200);
    console.log('response.message :>> ', response.message);
  });
});

afterAll(() => {
  console.log('Closing the app...');
  app.close();
});
