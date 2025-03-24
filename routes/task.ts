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
router.put("/:id",verifyRefreshToken,  taskController.updateTask);

//Delete a task
router.delete("/:id", verifyRefreshToken, taskController.deleteTask);

//Scheduled sessions CRUD actions
router.get("/:id/scheduled-sessions", verifyRefreshToken , taskController.getTaskScheduledSessions);
router.post("/:id/scheduled-sessions",  verifyRefreshToken, taskController.createScheduledSessions);
router.put("/:id/scheduled-sessions/:sessionId", verifyRefreshToken, taskController.updateScheduledSession);
router.delete("/:id/scheduled-sessions/:sessionId", verifyRefreshToken, taskController.deleteScheduledSession);

//Move scheduled sessions to completed sessions
router.put("/:id/completed-sessions", verifyRefreshToken, taskController.completeSessions)


export default router;