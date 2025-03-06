import express, { Request, Response, NextFunction } from 'express';
import * as authController from "../controllers/authController"

const router = express.Router();

router.get('/', (req: Request, res: Response , next: NextFunction) => {
    res.status(200).json({message: "Success auth route"})
});

router.post('/signup', authController.signup)

router.post('/login', authController.login)

router.get('/token', authController.token)

export default router