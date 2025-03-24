import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

let mongoServer: MongoMemoryServer
// Setup mock mongo server for tests
export const initializeMongoServer = async() => {
    mongoServer = await MongoMemoryServer.create(
        {instance: { dbName: 'testDb', storageEngine: 'ephemeralForTest' }}
    );
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
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
};