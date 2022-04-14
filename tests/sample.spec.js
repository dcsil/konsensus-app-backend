const request = require('supertest');
const app = require('../src/server');
const fileService = require('../src/files/file.service');
const crypto = require('crypto');

function delay() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

beforeAll(async () => {
  await delay();
  jest.setTimeout(50 * 1000);
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
  let auth1 = "Bearer ";
  let auth2 = "Bearer ";
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
    console.log('login response.body :>> ', response.body);
    console.log('response.statusCode :>> ', response.statusCode);
    auth1 += response.body.token;
    userId1 = response.body.id;
  });

  it('Get all organizations', async () => {
    console.log('auth1 :>> ', auth1);
    const response = await request(app)
      .get('/organization')
      .set('Authorization', auth1);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('Get current user', async () => {
    const response = await request(app)
      .get('/user/current')
      .set('Authorization', auth1);
    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe('Windsor');
    expect(response.body.lastName).toBe('Huang');
  });
  
  it('Create another user', async () => {
    let response = await request(app)
      .post('/user/register')
      .send({
        firstName: 'Julian',
        lastName: 'Nadeau',
        email: 'julianisnotcool@gmail.com',
        password: '123456',
        organizationId: organizationId
    });
    expect(response.statusCode).toBe(200);
    userId2 = response.body.id;

    response = await request(app)
      .post('/user/authenticate')
      .send({
        email: 'julianisnotcool@gmail.com',
        password: '123456'
      });
    expect(response.statusCode).toBe(200);
    auth2 += response.body.token;
    userId2 = response.body.id;
    // console.log('auth2 :>> ', auth2);
  });

  it('Get all users', async () => {
    const response = await request(app)
      .get('/user/all')
      .set('Authorization', auth1);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(1);
  });

  it('Get user by id', async () => {
    const response = await request(app)
      .get('/user/' + userId2)
      .set('Authorization', auth1);
    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe('Julian');
    expect(response.body.lastName).toBe('Nadeau');
  });

  const fileId = crypto.randomUUID()
  it('File upload', async () => {

    const params = {
      id: fileId,
      name: "not-a-real-file.png",
      type: "img/png",
      lastUpdater: userId1,
      size: 123,
  };

    const file = await fileService.createNewFileInDb(params);
    expect(file).toBeTruthy();
    // console.log('file :>> ', file);
    
    let response = await request(app)
      .get('/file/' + fileId)
      .set('Authorization', auth1);
    expect(response.statusCode).toBe(200);

    response = await request(app)
      .get('/file/' + fileId)
      .set('Authorization', auth2);
    expect(response.statusCode).not.toBe(200);

  });

  it('Getting owned files', async () => {
    const response = await request(app)
      .get('/file/owned')
      .set('Authorization', auth1);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('Getting recent files', async () => {
    const response = await request(app)
      .get('/file/recent')
      .set('Authorization', auth1);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('Adding a collaborator', async () => {
    const response = await request(app)
      .put('/permission/' + fileId)
      .set('Authorization', auth1)
      .send({
        email: "windsoriscool@gmail.com",
        canView: true,
        canEdit: true,
      });
    expect(response.statusCode).toBe(200);
  });

  it('Getting collaborators', async () => {
    const response = await request(app)
      .get('/permission/' + fileId + '/' + userId2)
      .set('Authorization', auth2);
    expect(response.statusCode).toBe(200);
    expect(response.body.canView).toBe(true);
    expect(response.body.canEdit).toBe(true);
    expect(response.body.canShare).toBe(false);
    expect(response.body.isAdmin).toBe(false);
  });

  it('Getting all files', async () => {
    const response = await request(app)
      .get('/file/all')
      .set('Authorization', auth2);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('Starring and unstarring a file', async () => {
    let response = await request(app)
      .put('/file/star/' + fileId)
      .set('Authorization', auth2);
    expect(response.statusCode).toBe(200);

    response = await request(app)
      .get('/file/starred')
      .set('Authorization', auth2);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);

    response = await request(app)
      .put('/file/star/' + fileId)
      .set('Authorization', auth2);
    expect(response.statusCode).toBe(200);

    response = await request(app)
      .get('/file/starred')
      .set('Authorization', auth2);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(0);
  });
});

afterAll(() => {
  console.log('Closing the app...');
  app.close();
});
