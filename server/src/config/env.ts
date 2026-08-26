import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/grandstay_hotel",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "grandstay_access_secret_super_secure_key_2026",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "grandstay_refresh_secret_super_secure_key_2026",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  emailUser: process.env.EMAIL_USER || "",
  emailAppPassword: process.env.EMAIL_APP_PASSWORD || "",
  emailFrom: process.env.EMAIL_FROM || "GrandStay Hotels <no-reply@grandstay.com>",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
};
