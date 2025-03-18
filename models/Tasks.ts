import mongoose from "mongoose";

const Schema = mongoose.Schema

const TaskSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required:true},
    name: {type:String, required:true},
    description: {type: String},
    duration: {type: Number, required:true, min:0.5},
    priority: {type: Number, min:1, max:3, default:1},
    maxHoursPerSession: {type: Number, min:0.5, default:3},
    deadline: {type:Date},

    scheduledSessions: [{
        day: {type: String, 
            enum: [["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]]},
            startTime:{type: String, match: /^\d{4}$/},
            duration:{type: Number}
    }],

    completedSessions: [{
        weekNumber: {type: Number},
        day: {type: String},
        startTime: {type: String, match: /^\d{4}$/},
        duration: {type: Number}
    }]
}, {timestamps: true});

export default mongoose.model("Task", TaskSchema)