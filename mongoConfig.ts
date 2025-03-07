import mongoose from "mongoose";
const mongoDB = process.env.DATABASE as string;

export default function mongoSetup() {

    mongoose.set("strictQuery", false);
    
    main().catch((err) => console.log(err));
    
    async function main() {
      await mongoose.connect(mongoDB);
      console.log("Connected to MongoDB")
    }
}

