 import {Express} from "express"
import { setup } from "./testSetup"
import { closeMongoServer, initializeMongoServer } from "./mongoSetup"
import authRouter from "../routes/auth"
import taskRouter from "../routes/task"
import request from "supertest"
import { jwtDecode } from "jwt-decode"
import { UserType } from "../models/user"
import Task from "../models/Tasks"


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
                .send({"tasks": 
                    [
                        {
                            "name": "Learn Italian",
                            "duration": 12,
                            "priority": 3,
                            "recurrent": true,
                        },
                        {
                            "name": "Learn Turkish",
                            "duration": 3,
                            "priority": 2,
                            "recurrent": true
                        }
                    ]
                       })
        const tasks = createTaskResponse.body.tasks;
        const newToken = createTaskResponse.body.token ;
        const updatedUser = jwtDecode<{user:UserType}>(newToken).user;
            
        expect(createTaskResponse.status).toBe(200);

        //Check if task info is correct and contains user ID
        expect(tasks[0].name).toEqual("Learn Italian");
        expect(tasks[0].userId).toEqual(updatedUser._id);

        //Check if user now contains tasks ID
        expect(tasks[0]._id).toEqual(updatedUser.tasks[0]);
        expect(tasks[1]._id).toEqual(updatedUser.tasks[1]);
    });
    it("Gets all tasks with completed hours", async() => {
        const loginResponse = await request(app)
            .post("/auth/login")
            .set("Accept", "application/json")
            .send({
                    "email": "testuser@email.com",
                    "password": "password",
            })
        
        const token = loginResponse.body.token
        const user = jwtDecode<{user:UserType}>(token).user;

        //Get tomorrow and this week's Monday's date
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);

        const monday = new Date(today);
        monday.setDate(diff);
        monday.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1)

        //Add a past scheduled session on Monday and future session tomorrow
        //To test completed hours
        await Task.findByIdAndUpdate(user.tasks[0] ,{
            scheduledSessions: [
                {startTime: monday,duration: 2},
                {startTime: tomorrow,duration: 3}
            ]
        })

        const getTasksResponse = await request(app)
            .get("/task")
            .set("authorization", `Bearer ${token}`)
            .send()

        const tasks = getTasksResponse.body.tasks; getTasksResponse.body.tasks
        expect(tasks[0]._id).toEqual(user.tasks[0]);
        expect(tasks[0].completedHours).toEqual(2);
        expect(tasks[0].totalHours).toEqual(5);
        expect(tasks[1].name).toEqual("Learn Turkish");

    })

})
