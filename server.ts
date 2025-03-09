import * as dotenv from "dotenv"
dotenv.config();
import express from "express";
import session from "express-session"
import mongoSetup from "./mongoConfig";
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import authRouter from "./routes/auth"

const port = process.env.PORT;

const app = express();

mongoSetup();

app.use(morgan('dev'));
app.use(cors());
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(session({
    secret: process.env.SECRET as string, 
    resave: false,
    saveUninitialized: true,
  }));

//Passport setup

import passport from "./utils/passport"
app.use(passport.initialize());
app.use(passport.session());

//Routes

app.use("/auth", authRouter)

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})


