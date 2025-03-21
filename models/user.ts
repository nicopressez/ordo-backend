import mongoose, { InferSchemaType, Types } from "mongoose"

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
            day:[{type: Number, required:true,  min: 0, max: 6}], //Day in number 0-6
            start: { type: Number, min: 0, max: 1439 },
            end: { type: Number, min: 0, max: 1439 },
        }]
    },
    tasks: [{ type: Schema.Types.ObjectId, ref:"Task" }],

}, { timestamps: true } 
);

export type UserType = InferSchemaType<typeof UserSchema> & {_id: Types.ObjectId}
export default mongoose.model("User", UserSchema)