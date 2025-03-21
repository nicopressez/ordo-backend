import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

let mongoServer: MongoMemoryServer
// Setup mock mongo server for tests
export const initializeMongoServer = async() => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    try {
        await mongoose.connect(mongoUri);

        console.log("MongoDB Connected Successfully!");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        throw error; // Fail the test immediately if connection fails
    };

};

export const closeMongoServer = async() => {
    if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop()
    }
};