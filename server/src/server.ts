import "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start Express Listener
    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 GrandStay Hotels Server running on PORT: ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
