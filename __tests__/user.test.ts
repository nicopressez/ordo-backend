import {Express, Request, Response, NextFunction} from "express"
import { setup } from "./testSetup"
import { closeMongoServer, initializeMongoServer } from "./mongoSetup"
import userRouter from "../routes/user"
import authRouter from "../routes/auth"
import request from "supertest"


let app : Express;

describe("User route tests", () => {
    beforeAll(async() => {
        app = setup();
        await initializeMongoServer();
        app.use("/user", userRouter);
        app.use("/auth", authRouter)
    });
    afterAll(async() => {
        await closeMongoServer();
    });
    it("User route works", async() => {
        const response = await request(app)
            .get("/user")
            .set("Accept", "application/json");
        
        expect(response.status).toEqual(200);
        expect(response.body.message).toEqual("User route");
    })
    it("Updates user preferences on put request", async() => {
        //Create user and get token for preferences update next
        const createUserResponse = await request(app)
            .post("/auth/signup")
            .set("Accept", "application/json")
            .send({
                "email": "testuser@email.com",
                "name": "john",
                "password": "password",
                "repeatPassword": "password"
            })

        const token = createUserResponse.body.token;

        //Create put request to update new user's preferences
        const updateUserResponse = await request(app)
            .put("/user/preferences")
            .set("Accept", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send({
                "sleepStart": "0000",
                "sleepEnd": "0800",
                "fixedTasks": [
                    {
                    "name": "Gym",
                    "day": ["Monday", "Wednesday", "Friday"],
                    "start": "1800",
                    "end": "1930"
                    },
                    {
                    "name": "Study",
                    "day": ["Tuesday", "Thursday"],
                    "start": "2000",
                    "end": "2200"
                    }
                ]
            });

        const updatedUser = updateUserResponse.body.user;
        const updatedToken = updateUserResponse.body.token;

        //Check if user info was updated and if token was refreshed
        expect(updatedUser.preferences.sleep.start).toEqual("0000");
        expect(updatedUser.preferences.fixedTasks[0].name).toEqual("Gym");
        expect(updatedToken).not.toEqual(token);
    });
    it("Preferences don't update with incorrect body request", async() => {
        //Create user and get token for preferences update next
        const createUserResponse = await request(app)
            .post("/auth/signup")
            .set("Accept", "application/json")
            .send({
                "email": "test@email.com",
                "name": "john",
                "password": "password",
                "repeatPassword": "password"
            })
            
        const token = createUserResponse.body.token;

        //Create put request to update new user's preferences
        const updateUserResponse = await request(app)
            .put("/user/preferences")
            .set("Accept", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send({
                "sleepStart": "0000",
                "sleepEnd": "0800",
                "fixedTasks": [
                    {
                        // Missing name in request
                    "day": ["Monday", "Wednesday", "Friday"],
                    "start": "1800",
                    "end": "1930"
                    },
                ]
            });

        //Body validation should catch the missing name and return an error
        expect(updateUserResponse.status).toBe(400)
    })
})