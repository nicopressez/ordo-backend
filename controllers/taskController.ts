import asyncHandler from "express-async-handler";
import Task from "../models/Tasks";

export const getAllTasks = asyncHandler(async(req, res, next) => {
 const tasks = await Task.find({
        userId: res.locals.user._id}, 
        "name duration scheduledSessions")
    .exec();

    if(!tasks) res.status(404).json({message: "No tasks found", token: res.locals.token})

    //Set this weeks Monday and today's date
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0,0,0,0);

    //Get tasks with progress in hours from this week
    const tasksWithProgress = tasks.map(task => {
        const completedHours = task.scheduledSessions
        ?.filter((session) => {
        // Check hours scheduled between this weeks Monday and today - completed hours
        const sessionDate = new Date(session.startTime)
        return sessionDate >= monday && sessionDate <= today;
        // Sum completed hours
        }).reduce((sum, session) => sum + session.duration, 0) || 0;

      return {
        _id: task._id,
        name: task.name,
        duration: task.duration,
        completedHours
      }
    });
    res.status(200).json({tasks: tasksWithProgress, token: res.locals.token})
})


export const getTask = [
    // Fetch all info on one task + completed sessions and completed hours

];

export const createTask = [

];

export const updateTask = [

];

export const deleteTask = [

]

export const updateTaskProgress = [

];

export const getTaskHistory = [

];

export const getTaskScheduledSessions = [

];

export const resetWeeklyProgress = [

];

