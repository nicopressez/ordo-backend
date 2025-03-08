import User from "../models/user"
import asyncHandler from "express-async-handler"
import { body, validationResult } from "express-validator"

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

    //Validate request body 
    
    asyncHandler(async(req,res,next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()})
        }
        next()
    }),

    

    asyncHandler(async(req,res, next) => {
        // API body cleans data, encrypt password JWT, creates user
        // Sends back JWT Token 
        res.status(200).json({ message: "Signup post"})
    })
]

export const login = [
    asyncHandler(async(req,res, next) => {
        res.status(200).json({ message: "Login post"})        
    })
]

export const token = [
    asyncHandler(async(req,res, next) => {
        res.status(200).json({ message: "Token request"})        
    })
]
