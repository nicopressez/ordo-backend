import User from "../models/user"
import asyncHandler from "express-async-handler"
import { body, validationResult } from "express-validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import passport from "../utils/passport"

export const signup = [
    //API request validations
    body("email")
        .trim()
        .custom(async (value) => {
            const user =  await User.findOne({email: value})
            if(user) {
                throw new Error("E-mail already in use")
            }
        })
        .isLength({min:5})
        .trim(),
    body("name", "Must be between 3 and 16 characters")
        .trim()
        .isLength({min:3, max:15})
        .escape(),
    body("password", "Must be at least 8 characters long")
        .trim()
        .isLength({min:8}),
    body("repeatPassword")
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error("Passwords don't match")
            }
            return true
        }),

    asyncHandler(async(req,res,next) => {
        //Validate request body 
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()})
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        // Register new user with form info
        const user = new User({
            email: req.body.email,
            name: req.body.name,
            password: hashedPassword
        })

        await user.save();
        //Return login token - user logged in after signup
        const token = jwt.sign(
            {user, iat: Date.now()},
            process.env.SECRET as string,
            {expiresIn: "24h"});
        res.status(200).json({token})
    }),
]

export const login = [
    body("email", "Invalid email")
        .trim()
        .isLength({min: 5}),
    body("password", "Invalid password")
        .trim()
        .isLength({min: 8}),
    asyncHandler(async(req,res, next) => {
        //Validate request body
        const errors= validationResult(req)
        if(!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()})
        }

        //Initiate login && handle errors
        passport.authenticate("local", {session: false}, 
            (err: any,user: Express.User | false, info: {message:string}) => {
            if(err || !user) {
                return res.status(401).json({info})
            }

            req.logIn(user, (err) => {
                if(err) return next(err)
            })

            //Generate JWT token
            const token = jwt.sign(
                {user, iat:Date.now()}, 
                process.env.SECRET as string,
                {expiresIn: "24h"}
            )
            return res.status(200).json({token})
        })(req,res,next)
    })
]
