
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
const router = require("../user.js");
const request = require("supertest");
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support url-encoded
app.use("/user", router);


describe('user api', () => {
    describe('get default', () => {
        it('returns valid json', async () => {
            const res = await request(app).get(`/user/default`);
            expect(res.body).toEqual(mock_settings);
        });
    });

    describe('pust updates and get updated', () => {
        const changes = {a: 321};
        xit('sends 205 and settings json', async () => {
            const res = await request(app)
                .post(`/user`)
                .send(changes);
            expect(res.status).toEqual(200);
            expect(res.body.settings.a).toEqual(321);
        });
        it('gets changed settings json', async () => {
            // TODO: changes
            const res = await request(app).get(`/user`);
            expect(res.body).toEqual(mock_settings);
        });
    });
});
