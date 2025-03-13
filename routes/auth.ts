import express from 'express';
import * as authController from "../controllers/authController"
import { verifyRefreshToken } from '../utils/tokenVerif';

const router = express.Router();

router.get('/', async(req,res,next) => {
    res.status(200).json({message: "auth route"})
})

router.post('/signup', authController.signup)

router.post('/login', authController.login)

router.post('/token', verifyRefreshToken, authController.tokenRefresh)

export default router