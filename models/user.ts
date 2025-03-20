import mongoose from "mongoose"

const Schema = mongoose.Schema

const UserSchema = new Schema({

    name: { type: String, minLength: 3, maxLength: 16, required:true },
    email : { type: String, minLength: 5, required:true, unique:true },
    password: { type: String, minLength: 8, required:true },
    schedules: [{ type: Schema.Types.ObjectId, ref: "Schedule" }],
    preferences: {
        sleep: {
            start: { type: Number, min: 0, max: 1439, default: 1380 }, // In minutes from 00:00
            end: { type: Number, min: 0, max: 1439, default: 420 },// In minutes from 00:00
        },
        fixedTasks: [{
            name: {type: String, required:true, maxLength: 12},
            day: [{ type: String, required:true,
                enum:["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]}],
            start: { type: String, required:true, minLength: 4, maxLength:4 },
            end: { type: String, required:true, minLength: 4, maxLength:4 },
        }]
    },
    tasks: [{ type: Schema.Types.ObjectId, ref:"Task" }],

}, { timestamps: true } 
);

export default mongoose.model("User", UserSchema)