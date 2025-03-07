import express from 'express';
import * as authController from "../controllers/authController"

const router = express.Router();

router.post('/signup', authController.signup)

router.post('/login', authController.login)

router.get('/token', authController.token)

export default router