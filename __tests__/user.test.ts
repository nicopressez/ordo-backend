import {Express} from "express"
import { setup } from "./testSetup"
import { closeMongoServer, initializeMongoServer } from "./mongoSetup"
import userRouter from "../routes/user"
import authRouter from "../routes/auth"
import request from "supertest"
import { jwtDecode } from "jwt-decode"
import bcrypt from "bcryptjs"
import User from "../models/user"

let app : Express;

describe("User route tests", () => {
    beforeAll(async() => {
        app = setup();
        await initializeMongoServer()
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
                "sleepStart": 1290,
                "sleepEnd": 480,
                "fixedTasks": [
                    {
                    "name": "Gym",
                    "day": [0, 3, 5],
                    "start": 180,
                    "end": 360
                    },
                    {
                    "name": "Study",
                    "day": [2,4],
                    "start": 200,
                    "end": 240
                    }
                ]
            });

        const updatedToken = updateUserResponse.body.token;
        const updatedUser = jwtDecode<{user:any}>(updatedToken).user

        //Check if user info was updated and if token was refreshed
        expect(updatedUser.preferences.sleep.start).toEqual(1290);
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
                "sleepStart": 1290,
                "sleepEnd": 480,
                "fixedTasks": [
                    {
                        // Missing name in request
                    "day": [1, 3, 5],
                    "start": 180,
                    "end": 360,
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
    });
    it("Deletes user on request", async() => {

        //Login to get token and decrypt user info
        const loginResponse = await request(app)
            .post("/auth/login")
            .set("Accept", "application/json")
            .send({
                "email": "test@email.com",
                "password": "newpassword",
            })

        const token = loginResponse.body.token;
        const initialUser = jwtDecode<{user:any}>(token).user 

        const response = await request(app)
            .delete("/user")
            .set("Accept", "application/json")
            .set("authorization", `Bearer ${token}`)
            .send({});

        expect(response.status).toBe(200)

        //Check if user no longer exists in DB
        const deletedUser = await User.findById(initialUser._id)
        expect(deletedUser).toBeFalsy();

    })
})