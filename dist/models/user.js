"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const UserSchema = new Schema({
    name: { type: String, minLength: 3, maxLength: 16, required: true },
    email: { type: String, minLength: 5, required: true, unique: true },
    password: { type: String, minLength: 8, required: true },
    schedules: [{ type: Schema.Types.ObjectId, ref: "Schedule" }],
    preferences: {
        sleep: {
            start: { type: String, default: "2300" },
            end: { type: String, default: "0700" }
        },
        fixedTasks: [{
                name: String,
                day: { type: String, required: true,
                    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
                start: { type: String, required: true },
                end: { type: String, required: true },
            }]
    },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
}, { timestamps: true });
exports.default = mongoose_1.default.model("User", UserSchema);
