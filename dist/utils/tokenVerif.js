"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const verifyRefreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "No token provided" });
            return;
        }
        //Verify token validity
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        const foundUser = yield user_1.default.findById(decoded.user._id);
        if (!foundUser) {
            res.status(404).json({
                message: "No user found with token", user: decoded.user._id
            });
            return;
        }
        //Generate new token
        const accessToken = jsonwebtoken_1.default.sign({ user: foundUser, iat: Date.now() }, process.env.SECRET, { expiresIn: "24h" });
        //Attach token and user on request
        req.user = foundUser;
        req.token = accessToken;
        next();
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            res.status(401).json({ message: "Token expired" });
            return;
        }
        res.status(401).json({ message: "Invalid token" });
        return;
    }
});
exports.verifyRefreshToken = verifyRefreshToken;
