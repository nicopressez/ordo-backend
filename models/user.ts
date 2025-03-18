import mongoose from "mongoose"

const Schema = mongoose.Schema

const UserSchema = new Schema({

    name: { type: String, minLength: 3, maxLength: 16, required:true },
    email : { type: String, minLength: 5, required:true, unique:true },
    password: { type: String, minLength: 8, required:true },
    schedules: [{ type: Schema.Types.ObjectId, ref: "Schedule" }],
    preferences: {
        sleep: {
            start: { type: String, default:"2300", match:/^\d{4}$/ },
            end: { type: String, default:"0700", match: /^\d{4}$/ }
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