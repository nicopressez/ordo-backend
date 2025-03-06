const mongoose = require("mongoose");
const mongoDB = process.env.DATABASE;

function mongoSetup() {

    mongoose.set("strictQuery", false);
    
    main().catch((err) => console.log(err));
    
    async function main() {
      await mongoose.connect(mongoDB);
      console.log("Connected to MongoDB")
    }
}

module.exports = mongoSetup;