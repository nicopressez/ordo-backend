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
            startTime:{type: Date, required:true},
            duration:{type: Number, required:true}
    }],

    completedSessions: [{
            startTime: {type: Date, required:true},
            duration: {type: Number, required:true }
    }]
}, {timestamps: true});

export default mongoose.model("Task", TaskSchema)