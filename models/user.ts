const mongoose = require("mongoose")

const Schema = mongoose.Schema

const UserSchema = new Schema({

    name: { type: String, minLength: 3, maxLength: 16, required:true },
    email : { type: String, minlength: 5, required:true, unique:true },
    password: { type: String, required:true },
    schedules: [{ type: Schema.Types.ObjectId, ref: "Schedule" }],
    preferences: {
        sleep: {
            start: { type: String, required:true },
            end: { type: String, required:true }
        },
        fixedTasks: [{
            name: String,
            day: { type: String, required:true,
                enum:["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]},
            start: { type: String, required:true },
            end: { type: String, required:true },
        }]
    },
    tasks: [{ type: Schema.Types.ObjectId, ref:"Task" }],

}, { timestamps: true } 
);

export default mongoose.model("User", UserSchema)