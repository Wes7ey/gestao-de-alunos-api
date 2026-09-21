import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongoServer = await MongoMemoryServer.create();
const mongoUri = mongoServer.getUri();

process.env.MONGODB_URI = mongoUri;
globalThis.__MONGO_SERVER__ = mongoServer;

await mongoose.connect(mongoUri);

console.log(`MongoMemoryServer conectado em ${mongoUri}`);
