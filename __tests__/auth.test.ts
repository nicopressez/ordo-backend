import authRouter from "../routes/auth"
import { setup } from "./testSetup"
import User from "../models/user"
import request from "supertest"
import {Express, Request, Response, NextFunction} from "express"
import { closeMongoServer, initializeMongoServer } from "./mongoSetup"
import { verifyRefreshToken } from "../utils/tokenVerif"
import asyncHandler from "express-async-handler"

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

    it("Login route returns error if no user/incorrect password", async() => {
        const response = await request(app)
            .post("/login")
            .set("Accept", "application/json")
            .send({
                "email": "testuser@gmail.com",
                "password": "invalidpassword"
            })

        expect(response.status).toEqual(401)
        expect(response.body.info).toEqual({
            "message": "No user found with this email and password combination."
        })
    })

    it("Login route logs user in and returns token", async() => {
        const response = await request(app)
            .post("/login")
            .set("Accept", "application/json")
            .send({
                "email":"testuser@gmail.com",
                "password":"validpassword"
            })

            expect(response.status).toEqual(200)
            expect(response.body.token).toBeDefined()
    })

    it("Token refresh middleware checks and sends new token", async() => {
        // Create mock route to test token refresh as middleware
        app.post("/token", verifyRefreshToken,
            asyncHandler(async (req: Request,res: Response, next: NextFunction) => {
                res.status(200).json({token: res.locals.token})
            })
        )

        // Login user to get initial token
        const loginResponse = await request(app)
        .post("/login")
        .set("Accept", "application/json")
        .send({
            "email": "testuser@gmail.com",
            "password": "validpassword"
        })

        const initialToken = loginResponse.body.token;

        // Send request with new token, and check response
        const response = await request(app)
            .post("/token")
            .set("authorization", `Bearer ${initialToken}`)
            .send();

        expect(response.status).toBe(200)
        expect(response.body.token).not.toEqual(initialToken)
        expect(response.body.token).toBeDefined()
    })
})

