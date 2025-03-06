const dotenv = require("dotenv").config();
const express = require("express");
const port = process.env.PORT;

const app = express();
const cors = require("cors")

const mongoSetup = require("./mongoConfig");
mongoSetup();


app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})


