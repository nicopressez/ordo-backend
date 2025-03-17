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
exports.tokenRefresh = exports.login = exports.signup = void 0;
const user_1 = __importDefault(require("../models/user"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("../utils/passport"));
exports.signup = [
    //API request validations
    (0, express_validator_1.body)("email")
        .trim()
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_1.default.findOne({ email: value });
        if (user) {
            throw new Error("E-mail already in use");
        }
    }))
        .isLength({ min: 5 })
        .trim(),
    (0, express_validator_1.body)("name", "Must be between 3 and 16 characters")
        .trim()
        .isLength({ min: 3, max: 15 })
        .escape(),
    (0, express_validator_1.body)("password", "Must be at least 8 characters long")
        .trim()
        .isLength({ min: 8 }),
    (0, express_validator_1.body)("repeatPassword")
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords don't match");
        }
        return true;
    }),
    (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        //Validate request body 
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, 10);
        // Register new user with form info
        const user = new user_1.default({
            email: req.body.email,
            name: req.body.name,
            password: hashedPassword
        });
        yield user.save();
        //Return login token - user logged in after signup
        const token = jsonwebtoken_1.default.sign({ user, iat: Date.now() }, process.env.SECRET, { expiresIn: "24h" });
        res.status(200).json({ token });
    })),
];
exports.login = [
    (0, express_validator_1.body)("email", "Invalid email")
        .trim()
        .isLength({ min: 5 }),
    (0, express_validator_1.body)("password", "Invalid password")
        .trim()
        .isLength({ min: 8 }),
    (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        //Validate request body
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        //Initiate login && handle errors
        passport_1.default.authenticate("local", { session: false }, (err, user, info) => {
            if (err || !user) {
                return res.status(401).json({ info });
            }
            req.logIn(user, (err) => {
                if (err)
                    return next(err);
            });
            //Generate JWT token
            const token = jsonwebtoken_1.default.sign({ user, iat: Date.now() }, process.env.SECRET, { expiresIn: "24h" });
            return res.status(200).json({ token });
        })(req, res, next);
    }))
];
exports.tokenRefresh = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (res.locals.token)
        res.status(200).json({ token: res.locals.token });
    else
        res.status(400).json({ message: "Invalid token" });
}));
