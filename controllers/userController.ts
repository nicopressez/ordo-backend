import { body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import User from "../models/user";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


export const updatePreferences = [
    // API request validation
    body("sleepStart")
        .isInt({min:0, max:1439})
        .withMessage("Sleep starting time is incorrect, should be an integer."),
    body("sleepEnd")
        .isInt({min:0, max:1439})
        .withMessage("Sleep ending time is incorrect, should be an integer."),
    body("fixedTasks")
        .isArray()
        .withMessage("Fixed tasks is not an array."),
    body("fixedTasks.*.name")
        .isString()
        .notEmpty()
        .isLength({max:12})
        .withMessage("Each fixed task must have a name"),
    body("fixedTasks.*.day")
        .isArray()
        .withMessage("Days must be an array of strings")
        .custom((days: number[]) => {
            return days.every(day => day >= 0 && day <= 6)
        }),
    body("fixedTasks.*.start")
        .isInt({min:0, max:1439})
        .withMessage("Incorrect time provided for a fixed task's start"),
    body("fixedTasks.*.end")
        .isInt({min:0, max:1439})    
        .withMessage("Incorrect time provided for a fixed task's end"),

    asyncHandler(async(req,res,next) => {
        //Validate request body
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()})
        }

        //Find user and update info 
        const updatedUser = await User.findByIdAndUpdate(res.locals.user._id, {
            preferences: {
                sleep: {
                    start: req.body.sleepStart,
                    end: req.body.sleepEnd,
                },
                fixedTasks: req.body.fixedTasks
            }
        }, {new:true})

        if(!updatedUser) res.status(404).json({message: "User not found"});

        //Generate new token with user info && pass to response
        const newToken = jwt.sign(
                    { user: updatedUser, iat: Date.now()},
                    process.env.SECRET as string,
                    {expiresIn: "24h"} 
                )

        res.status(200).json({token: newToken});
    }),

];

export const updateUser = [
    // API request validation
    body("email")
            .trim()
            .custom(async (value, {req}) => {
                const user =  await User.findOne({email: value})
                if(user && user._id.toString() !== req.params?.id) {
                    throw new Error("E-mail already in use")
                }
            })
            .withMessage("Email already in use")
            .isLength({min:5})
            .withMessage("Email address must be at least 5 characters long"),
    body("name")
        .isLength({min:3, max:15})
        .withMessage("Name must be between 3 and 15 characters long"),
    body("password")
        .isLength({min:8})
        .custom(async(value, {req}) => {
            // Check password match to confirm account changes
            const user = await User.findById(req.params?.id);
            if(!user) throw new Error(`No user found with id ${req.params?.id}`);

            const match = await bcrypt.compare(value, user.password);
            if(!match) throw new Error("Wrong password");
        }),

    asyncHandler(async(req ,res,next) => {
        //Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()})
        };

        // If new password set, crypt and update user
        if(req.body.newPassword) {
            const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
            await User.findByIdAndUpdate(req.params.id, {password: hashedPassword});
        }
        // Update other user info
        const user = await User.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            email: req.body.email,
        }, {new:true});

        if(!user) res.status(404).json({message: "User not found"});
        
        //Generate new token with user info && pass to response
        const newToken = jwt.sign(
            { user: user, iat: Date.now()},
            process.env.SECRET as string,
            {expiresIn: "24h"} 
        )
        res.status(200).json({token: newToken})
    })
];

export const deleteUser = asyncHandler(async(req,res,next) => {
    const user = await User.findByIdAndDelete(res.locals.user._id)

    if(!user) res.status(404).json({response:"No user found to delete with id" + res.locals.user._id})

    res.status(200).json({message : "User deleted"});
}) 