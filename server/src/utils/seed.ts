import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.model.js";
import { Room } from "../models/Room.model.js";
import { Reservation } from "../models/Reservation.model.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const seedData = async () => {
  try {
    console.log("🌱 Starting Database Seeding Process...");

    await connectDB();

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Reservation.deleteMany({}),
    ]);
    console.log("🧹 Cleared all existing database records.");

    // Seed ONLY Staff User
    const staffUser = await User.create({
      name: "System Admin",
      email: "admin@grandstay.com",
      password: "Password123!",
      phone: "+1-800-555-0199",
      role: "staff",
      isActive: true,
    });

    console.log(`👤 Created Staff Account: ${staffUser.email}`);
    console.log("✅ Database reset complete with Staff account only!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  }
};

seedData();
