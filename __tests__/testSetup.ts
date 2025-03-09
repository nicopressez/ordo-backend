import * as dotenv from "dotenv"
dotenv.config()
import express from "express";
import session from "express-session"
import { initializeMongoServer } from "./mongoSetup";
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import passport from "../utils/passport"

export const setup = () => {
    const app = express();
    
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
    app.use(passport.initialize());
    app.use(passport.session());
}




