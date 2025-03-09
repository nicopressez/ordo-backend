import authRouter from "../routes/auth"
import { setup } from "./testSetup"
import User from "../models/user"

import request from "supertest"
import express, {Express} from "express"
import { closeMongoServer, initializeMongoServer } from "./mongoSetup"

let app : Express; 

describe("Auth route tests", () => {
    beforeAll(async() => {
        app = setup();
        await initializeMongoServer()
        app.use("/", authRouter)
    });

    afterAll(async() => {
        await closeMongoServer();
    });

    it("Auth route works", async() => {
        const response = await request(app)
            .get("/")
            .set("Accept", "application/json")
            
        expect(response.status).toEqual(200)
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body.message).toEqual("auth route")
    });

    it("Signup route returns form errors", async() => {
        // Send empty POST request
        const response = await request(app)
            .post("/signup")
            .set("Accept", "application/json")
            .send({})
        
        // Check validation errors
        expect(response.status).toEqual(400)
        expect(response.body.errors[0]).toEqual({
            "type": "field",
            "value": "",
            "msg": "Invalid value",
            "path": "email",
            "location": "body"
        })
    })
    it("Signup new user and get back token", async() => {
        // Send valid POST request
        const response = await request(app)
            .post("/signup")
            .set("Accept", "application/json")
            .send({
                "email": "testuser@gmail.com",
                "name": "john",
                "password": "validpassword",
                "repeatPassword": "validpassword"
            })

        expect(response.status).toEqual(200)
        // Check if new user created && token returned
        const user = await User.findOne({email: "testuser@gmail.com"})
        expect(user).toBeDefined();
        expect(response.body.token).toBeDefined();
    })
})

