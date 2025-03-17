import { body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import User from "../models/user";


export const updatePreferences = [
    // API request validation
    body("sleepStart")
        .isString()
        .isLength({min: 4, max:4})
        .withMessage("Sleep starting time is incorrect, should be in HHMM format."),
    body("sleepEnd")
        .isString()
        .isLength({min: 4, max:4})
        .withMessage("Sleep ending time is incorrect, should be in HHMM format."),
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
        .custom((days: string[]) => {
            const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            return days.every(day => validDays.includes(day))
        }),
    body("fixedTasks.*.start")
        .isString()
        .isLength({min: 4, max: 4})
        .withMessage("Incorrect time provided for a fixed task's start"),
    body("fixedTasks.*.end")
        .isString()
        .isLength({min: 4, max: 4})
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

        res.status(200).json({user: updatedUser, token: res.locals.token});
    }),

];

export const updateUser = [

];

export const deleteUser = [

];