import * as dotenv from "dotenv"
dotenv.config();
import express from "express";
import mongoSetup from "./mongoConfig";

import authRouter from "./routes/auth"

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoSetup();

const port = process.env.PORT;

//Routes

app.use("/auth", authRouter)

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})


