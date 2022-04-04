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

describe('Main test suite', () => {

  let organizationId;
  let auth = "Bearer ";
  let userId1;
  let userId2;

  it('Create an organization', async () => {
    const response = await request(app)
      .post('/organization/create')
      .send({
        name: 'Facebook',
      });
    expect(response.statusCode).toBe(200);
    organizationId = response.body.organizationId;
  });

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
  });

  it('Login a user', async () => {
    const response = await request(app)
      .post('/user/authenticate')
      .send({
        email: 'windsoriscool@gmail.com',
        password: '123456'
      });
    expect(response.statusCode).toBe(200);
    auth += response.body.token;
    userId1 = response.body.userId;
  });

  it('Get all organizations', async () => {
    const response = await request(app)
      .get('/organization')
      .set('Authorization', auth);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('Get current user', async () => {
    const response = await request(app)
      .get('/user/current')
      .set('Authorization', auth);
    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe('Windsor');
    expect(response.body.lastName).toBe('Huang');
  });
  
  it('Create another user', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({
        firstName: 'Julian',
        lastName: 'Nadeau',
        email: 'julianisnot@gmail.com',
        password: '123456',
        organizationId: organizationId});
    expect(response.statusCode).toBe(200);
    userId2 = response.body.id;
  });

  it('Get all users', async () => {
    const response = await request(app)
      .get('/user/all')
      .set('Authorization', auth);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('Get user by id', async () => {
    const response = await request(app)
      .get('/user/' + userId2)
      .set('Authorization', auth);
    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe('Julian');
    expect(response.body.lastName).toBe('Nadeau');
  });

});

afterAll(() => {
  console.log('Closing the app...');
  app.close();
});
