import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

let mongoServer: MongoMemoryServer
// Setup mock mongo server for tests
export const initializeMongoServer = async() => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    mongoose.connect(mongoUri);

    mongoose.connection.on("error", e => {
        if (e.message.code === "ETIMEDOUT") {
            console.log(e);
            mongoose.connect(mongoUri)
        }
        console.log(e)
    }) 

    mongoose.connection.once("open", () => {})
}

export const closeMongoServer = async() => {
    await mongoose.disconnect();
    await mongoServer.stop()
}