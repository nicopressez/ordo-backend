import {Express} from "express"
import { setup } from "./testSetup"
import { closeMongoServer, initializeMongoServer } from "./mongoSetup"
import authRouter from "../routes/auth"
import taskRouter from "../routes/task"
import request from "supertest"
import User from "../models/user"
import Task from "../models/Tasks"


let app : Express;

describe("Task route tests", () => {
    beforeAll(async() => {
        app = setup();
        await initializeMongoServer();
        app.use("/auth", authRouter);
        app.use("/task", taskRouter);
    });
    afterAll(async() => {
        await closeMongoServer();
    }) 
})