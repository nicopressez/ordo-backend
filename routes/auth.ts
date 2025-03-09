import express from 'express';
import * as authController from "../controllers/authController"

const router = express.Router();

router.get('/', async(req,res,next) => {
    res.status(200).json({message: "auth route"})
})

router.post('/signup', authController.signup)

router.post('/login', authController.login)

export default router