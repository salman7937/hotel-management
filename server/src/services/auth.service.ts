import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { RegisterInput, LoginInput } from "../validators/auth.validator.js";
import { generateAccessToken, generateRefreshToken, TokenPayload } from "../utils/generateToken.js";

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "An account with this email address already exists.");
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
    phone: input.phone || "",
    role: "customer",
  });

  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, accessToken, refreshToken };
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account has been deactivated. Please contact support.");
  }

  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, accessToken, refreshToken };
};

export const refreshUserToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is missing.");
  }

  try {
    const secret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";
    const decoded = jwt.verify(refreshToken, secret) as TokenPayload;

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new ApiError(401, "Invalid refresh token or deactivated user.");
    }

    const payload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(payload);
    return { accessToken: newAccessToken };
  } catch (error) {
    throw new ApiError(401, "Expired or invalid refresh token.");
  }
};

export const getUserProfile = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new ApiError(404, "User profile not found.");
  }
  return user;
};
