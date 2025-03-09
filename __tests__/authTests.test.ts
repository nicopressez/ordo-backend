import authRouter from "../routes/auth"
import { setup } from "./testSetup"
import User from "../models/user"

import request from "supertest"
import express from "express"
import { closeMongoServer, initializeMongoServer } from "./mongoSetup"
const app = express();

describe("Auth route tests", () => {
    beforeAll(async() => {
        setup();
        await initializeMongoServer()
        app.use("/", authRouter)
    });
    afterAll(async() => {
        await closeMongoServer();
    })
    it("Auth route works", async() => {

        const response = await request(app)
            .get("/")
            .set("Accept", "application/json")
            
        expect(response.status).toEqual(200)
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body.message).toEqual("auth route")
    })
})

