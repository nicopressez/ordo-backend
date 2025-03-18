import {Express, Request, Response, NextFunction} from "express"
import { setup } from "./testSetup"
import { closeMongoServer, initializeMongoServer } from "./mongoSetup"
import userRouter from "../routes/user"
import authRouter from "../routes/auth"
import request from "supertest"
import { jwtDecode } from "jwt-decode"
import bcrypt from "bcryptjs"


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

        const updatedToken = updateUserResponse.body.token;
        const updatedUser = jwtDecode<{user:any}>(updatedToken).user

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
    });
    it("Updates user info on put request", async() => {
        //Login to get token and decrypt user info
        const loginResponse = await request(app)
            .post("/auth/login")
            .set("Accept", "application/json")
            .send({
                "email": "test@email.com",
                "password": "password",
            })

        const token = loginResponse.body.token;
        const initialUser = jwtDecode<{user:any}>(token).user 

        //Request password and name change
        const updateUserResponse = await request(app)
            .put(`/user/${initialUser._id}`)
            .set("Accept", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send({
                "email": "test@email.com",
                "name": "Jane",
                "password": "password",
                "newPassword": "newpassword",
            });

        //Fetch user data from decoded token
        const updatedToken = updateUserResponse.body.token;
        const updatedUser = jwtDecode<{user:any}>(updatedToken).user;

        expect(updatedUser.name).toEqual("Jane");
        expect(token).not.toEqual(updatedToken)

        //Compare new password to confirm change
        const passwordCheck = await bcrypt.compare("newpassword", updatedUser.password)
        expect(passwordCheck).toBeTruthy()
    })
})