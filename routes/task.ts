import express from 'express';
import * as taskController from "../controllers/taskController"
import { verifyRefreshToken, verifyToken } from '../utils/tokenVerif';

const router = express.Router();

//Get tasks
router.get("/", verifyRefreshToken, taskController.getAllTasks);
router.get("/:id", verifyRefreshToken, taskController.getTask);

//Create a new task
router.post("/",verifyToken, taskController.createTask);

//Update a task
router.put("/",verifyRefreshToken,  taskController.updateTask);

//Delete a task
router.delete("/", verifyRefreshToken, taskController.deleteTask);

//Get task history
router.get("/:id/history", taskController.getTaskHistory);

//Scheduled sessions CRUD actions
router.get("/:id/scheduled-sessions", taskController.getTaskScheduledSessions);
router.post("/:id/scheduled-sessions", taskController.createScheduledSessions);
router.put("/:id/scheduled-sessions", taskController.updateScheduledSessions);
router.delete("/:id/scheduled-sessions", taskController.deleteScheduledSessions);


export default router;