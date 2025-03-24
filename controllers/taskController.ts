import asyncHandler from "express-async-handler";
import Task, { TaskType } from "../models/Tasks";
import { body, validationResult } from "express-validator";
import User from "../models/user";
import jwt from "jsonwebtoken"

interface sessionType {
    startTime: Date;
    duration: number;
}

//Return this weeks Monday and today's date 
const getWeekdays = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0,0,0,0);

    return {today, monday}
};

//Calculate progress this week for a task
const getTaskProgress = (allSessions: sessionType[]) => {
    const days = getWeekdays();
    let completedHours = 0;
        let totalHours = 0;
        let active = true;

    allSessions.forEach(session => {
        const sessionDate = new Date(session.startTime)
        if(sessionDate >= days.monday && sessionDate <= days.today) {
            completedHours += session.duration;
        };
        if(sessionDate >= days.monday) {
            totalHours += session.duration;
        } else {
            active = false;
        };
    })
    return {completedHours,totalHours,active}
}

export const getAllTasks = asyncHandler(async(req, res, next) => {
 const tasks = await Task.find({
        userId: res.locals.user._id}, 
        "name duration scheduledSessions")
    .exec();

    if(!tasks) res.status(404).json({message: "No tasks found", token: res.locals.token})

    const days = getWeekdays();
    //Get tasks with progress in hours from this week
    const tasksWithProgress = tasks.map(task => {
      const {completedHours, totalHours, active} = getTaskProgress(task.scheduledSessions)
      return {
        _id: task._id,
        name: task.name,
        duration: task.duration,
        completedHours,
        totalHours,
        active
      }
    });
    res.status(200).json({tasks: tasksWithProgress, token: res.locals.token})
})


export const getTask = 
    asyncHandler(async(req,res,next) => {
        const task = await Task.findById(req.params.id);

        if(!task) {
            res.status(404).json({message: "No task found", token: res.locals.token})
        } else {
        //Calculate progress and add to task info
        const {completedHours, totalHours, active} = getTaskProgress(task.scheduledSessions)
        const taskWithProgress = {
            ...task,
            completedHours,
            totalHours,
            active
        }
        res.status(200).json({task: taskWithProgress, token: res.locals.token})
        }
    });

export const createTask = [
    //API request validation
    body("tasks")
        .isArray({min:1})
        .withMessage("Tasks must be an array of at least 1 task"),
    body("tasks.*.name")
        .isString()
        .isLength({min:1, max:40})
        .withMessage("Name must be between 1 and 40 characters long"),
    body("tasks.*.duration")
        .isFloat({min:0.5})
        .withMessage("Duration must be a valid float number"),
    body("tasks.*.priority")
        .isInt({min:1, max:3})
        .withMessage("Priority must be an integer between 1 and 3"),
    body("tasks.*.recurrent")
        .isBoolean()
        .withMessage("Missing task recurrence boolean"),
    body("tasks.*.deadline")
        .optional()
        .isInt({min:0, max:6})
        .withMessage("Deadline must be an integer from 0 to 6"),
    body("tasks.*.maxHoursPerSession")
        .optional()
        .isFloat({min:0.5})
        .withMessage("Max hours must be at least 0.5 and a valid float"),
    body("tasks.*.description")
        .optional()
        .isString()
        .withMessage("Description must be a valid string"),

    asyncHandler(async(req,res,next) => {
        //Validate request
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()})
        }

        const userId = res.locals.user._id
        const tasksData: TaskType[] = req.body.tasks

        //Create tasks with body && user ID
        const newTasks = await Task.insertMany(
            tasksData.map(task => ({
                userId,
                name: task.name,
                priority: task.priority,
                duration: task.duration,
                recurrent: task.recurrent,
                ...(task.description && {description: task.description}),
                ...(task.maxHoursPerSession && {maxHoursPerSession: task.maxHoursPerSession}),
                ...(task.deadline && {deadline: task.deadline}),

            })
        ))

        //Append task ID to User
        const taskIds = newTasks.map(task => task._id)
        const updatedUser = await User.findByIdAndUpdate(userId,{
            $push: {tasks: { $each: taskIds}}
        }, {new:true})

        //Create new token with updated user info
        const newToken = jwt.sign(
                { user: updatedUser, iat: Date.now()},
                process.env.SECRET as string,
                {expiresIn: "24h"} );

        res.status(200).json({tasks: newTasks, token: newToken});
    })
];

export const updateTask = [
    //API request validation
    body("name")
        .optional()
        .isString()
        .isLength({min:1, max:40})
        .withMessage("Name must be between 1 and 40 characters long"),
    body("duration")
        .optional()
        .isFloat({min:0.5})
        .withMessage("Duration must be a valid float number"),
    body("priority")
        .optional()
        .isInt({min:1, max:3})
        .withMessage("Priority must be an integer between 1 and 3"),
    body("recurrent")
        .optional()
        .isBoolean()
        .withMessage("Missing task recurrence boolean"),
    body("deadline")
        .optional()
        .isInt({min:0, max:6})
        .withMessage("Deadline must be an integer from 0 to 6"),
    body("maxHoursPerSession")
        .optional()
        .isFloat({min:0.5})
        .withMessage("Max hours must be at least 0.5 and a valid float"),
    body("description")
        .optional()
        .isString()
        .withMessage("Description must be a valid string"),

    asyncHandler(async(req,res,next) => {
        //Validate request body
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()});
        };

        //Update task based on body info
        const body = req.body
        const task = await Task.findByIdAndUpdate(req.params.id, {
            ...body.name && {name: body.name},
            ...body.description && {description: body.description},
            ...body.duration && {duration: body.duration},
            ...body.priority && {priority: body.priority},
            ...body.maxHoursPerSession && {maxHoursPerSession : body.maxHoursPerSession},
            ...body.deadline && {deadline: body.deadline},
            ...body.recurrent && {recurrent: body.recurrent}
        }, {new: true});

        if(!task) res.status(404).json({message: "No task found"});

        res.status(200).json({task, token: res.locals.token})
    })
];

export const deleteTask = asyncHandler(async(req,res,next) => {
    const task = await Task.findByIdAndDelete(req.params.id);

    if(!task) res.status(404).json({message: "No task found"});

    res.status(200).json({message:"Task deleted successfully", token: res.locals.token});
})

export const getTaskScheduledSessions = asyncHandler(async(req,res,next) => {
    const task = await Task.findById(req.params.id, "scheduledSessions");

    if (!task) res.status(404).json({message: "No task found"});

    res.status(200).json({scheduledSessions: task?.scheduledSessions, token: res.locals.token})
})

export const createScheduledSessions = [
    //API request validation
    body("scheduledSessions")
        .isArray({min:1})
        .withMessage("Scheduled sessions must be a non-empty array"),
    body("scheduledSessions.*.startTime")
        .isISO8601().toDate()
        .withMessage("Start date must be a date type"),
    body("scheduledSessions.*.duration")
        .isFloat()
        .withMessage("Duration must be a valid float number"),

    asyncHandler(async(req,res,next) => {
        //Validate request
        const errors = validationResult(req)
        if(!errors.isEmpty()) res.status(400).json({errors: errors.array()});

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, {
            $push: {scheduledSessions: req.body.scheduledSessions}
        }, {new:true}).exec();

        if(!updatedTask) res.status(404).json({message: "No task found"});

        res.status(200).json({task: updatedTask, token: res.locals.token})
    })
]

export const updateScheduledSession = [
    //API request validation
    body("startTime")
        .isISO8601().toDate()
        .withMessage("Start date must be a date type"),
    body("duration")
        .isFloat()
        .withMessage("Duration must be a valid float number"),

    asyncHandler(async(req,res,next) => {
        //Validate request
        const errors = validationResult(req);
        if(!errors.isEmpty()) res.status(400).json({errors: errors.array()});

        const updatedTask = await Task.findOneAndUpdate(
            {_id: req.params.id, "scheduledSessions._id": req.params.sessionId}, 
            {
                $set: {
                    "scheduledSessions.$.startTime": req.body.startTime,
                    "scheduledSessions.$.duration": req.body.duration
                }
            }, {new:true});

        if(!updatedTask) res.status(404).json({message: "No scheduled session or task found"})

        res.status(200).json({task: updatedTask, token: res.locals.token})
    })
];

export const deleteScheduledSession = [
    asyncHandler(async(req,res,next) => {
        const task = await Task.findOneAndUpdate({_id: req.params.id},{ 
                $pull: {
                    scheduledSessions: {
                        _id: req.params.sessionId
                    }
                }
            }, {new: true}
        )
        if (!task) res.status(404).json({message: "No task found"})
        res.status(200).json({task, token: res.locals.token})
        })

];

export const completeSessions = [
    
]

export const getTaskHistory = [
//Return completed sessions per week "Mon 1st - Sun 7th: hoursworked - and then sessions"
];

