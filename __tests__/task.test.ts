 import {Express} from "express"
import { setup } from "./testSetup"
import { closeMongoServer, initializeMongoServer } from "./mongoSetup"
import authRouter from "../routes/auth"
import taskRouter from "../routes/task"
import request from "supertest"


let app : Express;

describe("Task route tests", () => {
    beforeAll(async() => {
        app = setup();
        await initializeMongoServer()
        app.use("/auth", authRouter);
        app.use("/task", taskRouter);
    });
    afterAll(async() => {
        await closeMongoServer();
    });

   it("Creates tasks with new user", async() => {
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

        const createTaskResponse = await request(app)
                .post("/task/")
                .set("Accept", "application/json")
                .set("authorization", `Bearer ${token}`)
                .send({"tasks": [
                                    {
                                        "name": "Learn Italian",
                                        "duration": 12,
                                        "priority": 3
                                    },
                                    {
                                        "name": "Learn Turkish",
                                        "duration": 3,
                                        "priority": 2
                                    }
                                ]
                       })
                
        expect(createTaskResponse.status).toBe(200)
    });

})
