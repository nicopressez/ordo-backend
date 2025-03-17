import express from 'express';
import * as userController from "../controllers/userController"
import { verifyRefreshToken } from '../utils/tokenVerif';

const router = express.Router();

router.get("/", async(req,res,next) => {
    res.status(200).json({message: "User route"})
});

router.put("/preferences", verifyRefreshToken, userController.updatePreferences)

router.put("/", verifyRefreshToken, userController.updateUser);

router.delete("/", verifyRefreshToken, userController.deleteUser);

export default router;

