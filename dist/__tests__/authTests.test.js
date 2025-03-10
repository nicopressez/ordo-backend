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
const auth_1 = __importDefault(require("../routes/auth"));
const testSetup_1 = require("./testSetup");
const user_1 = __importDefault(require("../models/user"));
const supertest_1 = __importDefault(require("supertest"));
const mongoSetup_1 = require("./mongoSetup");
const tokenVerif_1 = require("../utils/tokenVerif");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
let app;
describe("Auth route tests", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = (0, testSetup_1.setup)();
        yield (0, mongoSetup_1.initializeMongoServer)();
        app.use("/", auth_1.default);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mongoSetup_1.closeMongoServer)();
    }));
    it("Auth route works", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get("/")
            .set("Accept", "application/json");
        expect(response.status).toEqual(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body.message).toEqual("auth route");
    }));
    it("Signup route returns form errors", () => __awaiter(void 0, void 0, void 0, function* () {
        // Send empty POST request
        const response = yield (0, supertest_1.default)(app)
            .post("/signup")
            .set("Accept", "application/json")
            .send({});
        // Check validation errors
        expect(response.status).toEqual(400);
        expect(response.body.errors[0]).toEqual({
            "type": "field",
            "value": "",
            "msg": "Invalid value",
            "path": "email",
            "location": "body"
        });
    }));
    it("Signup new user and get back token", () => __awaiter(void 0, void 0, void 0, function* () {
        // Send valid POST request
        const response = yield (0, supertest_1.default)(app)
            .post("/signup")
            .set("Accept", "application/json")
            .send({
            "email": "testuser@gmail.com",
            "name": "john",
            "password": "validpassword",
            "repeatPassword": "validpassword"
        });
        expect(response.status).toEqual(200);
        // Check if new user created && token returned
        const user = yield user_1.default.findOne({ email: "testuser@gmail.com" });
        expect(user).toBeDefined();
        expect(response.body.token).toBeDefined();
    }));
    it("Login route returns error if no user/incorrect password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/login")
            .set("Accept", "application/json")
            .send({
            "email": "testuser@gmail.com",
            "password": "invalidpassword"
        });
        expect(response.status).toEqual(401);
        expect(response.body.info).toEqual({
            "message": "No user found with this email and password combination."
        });
    }));
    it("Login route logs user in and returns token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/login")
            .set("Accept", "application/json")
            .send({
            "email": "testuser@gmail.com",
            "password": "validpassword"
        });
        expect(response.status).toEqual(200);
        expect(response.body.token).toBeDefined();
    }));
    it("Token refresh middleware checks and sends new token", () => __awaiter(void 0, void 0, void 0, function* () {
        // Create mock route to test token refresh as middleware
        app.post("/token", tokenVerif_1.verifyRefreshToken, (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
            res.status(200).json({ token: req.token });
        })));
        // Login user to get initial token
        const loginResponse = yield (0, supertest_1.default)(app)
            .post("/login")
            .set("Accept", "application/json")
            .send({
            "email": "testuser@gmail.com",
            "password": "validpassword"
        });
        const initialToken = loginResponse.body.token;
        // Send request with new token, and check response
        const response = yield (0, supertest_1.default)(app)
            .post("/token")
            .set("authorization", `Bearer ${initialToken}`)
            .send();
        expect(response.status).toBe(200);
        expect(response.body.token).not.toEqual(initialToken);
        expect(response.body.token).toBeDefined();
    }));
});
