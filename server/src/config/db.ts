import mongoose from "mongoose";

// Cached across invocations of the same warm serverless instance, so a
// Vercel function doesn't open a new MongoDB connection on every request.
let cachedConnection: typeof mongoose | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const connString = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/grandstay_hotel";
  const conn = await mongoose.connect(connString);
  console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  cachedConnection = conn;
  return conn;
};
