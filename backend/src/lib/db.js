import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();


const MONGODB_URI='mongodb+srv://prateekchittor:FBvYUdipRBZ0b5tU@clusterchatapp.alrfpph.mongodb.net/chatapp?retryWrites=true&w=majority'

const client = new MongoClient(MONGODB_URI);


const DB_NAME = 'chatapp';

let db = null;


export const connectDB = async () => {
    try {
        await client.connect();
        db = client.db(DB_NAME);
        console.log(`MongoDB connected successfully to database: ${DB_NAME}`);
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
    }
};

export const getDB = () => {
    if (!db) throw new Error("DB not initialized. Call connectDB() first.");
    return db;
};
