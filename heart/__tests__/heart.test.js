
const mock_settings = {
        settings: {"a": 1},
        sum: "def"
    }

jest.mock('../settings_default.json', () => {return {
        settings: {"a": 1},
        sum: "def"
    }},
    { virtual: true });
jest.mock('../settings.json', () => {return {
        settings: {"a": 1},
        sum: "def"
    }},
    { virtual: true });

const settings = require('../settings.js');

const express = require("express");
const router = require("../heart.js");
const request = require("supertest");
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support url-encoded
app.use("/heart", router);


describe('heart', () => {
    describe('beat with no sum', () => {
        it('responses with 400', async () => {
            const res = await request(app).get(`/heart`);
            expect(res.status).toEqual(400);
        })
    })
    describe('beat with matching sum', () => {
        it('responses with 200', async () => {
            const res = await request(app)
                .get(`/heart`)
                .query({s: mock_settings.sum});
            expect(res.status).toEqual(200);
        })
    })
});
