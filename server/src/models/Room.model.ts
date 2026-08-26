import mongoose, { Schema, Document, Model } from "mongoose";

export type RoomType = "Standard" | "Deluxe" | "Executive" | "Family" | "Suite";

export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId;
  roomNumber: string;
  roomType: RoomType;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  bedType: string;
  facilities: string[];
  images: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    roomType: {
      type: String,
      enum: ["Standard", "Deluxe", "Executive", "Family", "Suite"],
      required: [true, "Room type is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price per night cannot be negative"],
    },
    maxGuests: {
      type: Number,
      required: [true, "Maximum guests capacity is required"],
      min: [1, "Room must accommodate at least 1 guest"],
    },
    bedType: {
      type: String,
      required: [true, "Bed type is required"],
      default: "Single",
    },
    facilities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>("Room", roomSchema);
