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

//Update completed hours
router.patch("/:id/progress", taskController.updateTaskProgress)

//Get task history
router.get("/:id/history", taskController.getTaskHistory);

//Get scheduled sessions
router.get("/:id/scheduled-sessions", taskController.getTaskScheduledSessions);

//Reset progress for a new week
router.post("/reset-progress", taskController.resetWeeklyProgress);
export default router;