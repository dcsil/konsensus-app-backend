const request = require('supertest');
const app = require("../server");

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