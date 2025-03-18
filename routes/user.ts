import express from 'express';
import * as userController from "../controllers/userController"
import { verifyRefreshToken, verifyToken } from '../utils/tokenVerif';

const router = express.Router();

router.get("/", async(req,res,next) => {
    res.status(200).json({message: "User route"})
});

router.put("/preferences", verifyToken, userController.updatePreferences)

router.put("/:id", verifyToken, userController.updateUser);

router.delete("/", verifyToken, userController.deleteUser);

export default router;

