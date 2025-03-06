import User from "../models/user"
import asyncHandler from "express-async-handler"

export const signup = [
    asyncHandler(async(req,res, next) => {
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
