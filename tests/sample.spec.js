const request = require('supertest');
const app = require("../src/server");

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

    it('tests / endpoint', async() => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toEqual("Hello World!");
    });
});

afterAll(() => { console.log('Closing the app...'); app.close(); });