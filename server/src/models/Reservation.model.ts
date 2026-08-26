import mongoose, { Schema, Document, Model } from "mongoose";

export type BookingStatus = "Pending" | "Confirmed" | "Checked-in" | "Checked-out" | "Cancelled";
export type PaymentMethod = "online" | "cash";
export type PaymentStatus = "unpaid" | "paid";

export interface IReservation extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: string;
  guest?: mongoose.Types.ObjectId;
  guestName: string;
  email: string;
  phone: string;
  room: mongoose.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  specialRequests?: string;
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripeSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    guest: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    guestName: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
      index: true,
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"],
      index: true,
    },
    checkOutDate: {
      type: Date,
      required: [true, "Check-out date is required"],
      index: true,
    },
    numberOfGuests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "At least 1 guest is required"],
    },
    specialRequests: {
      type: String,
      default: "",
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Checked-in", "Checked-out", "Cancelled"],
      default: "Pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["online", "cash"],
      required: [true, "Payment method is required"],
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    stripeSessionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast availability overlap checks
reservationSchema.index({ room: 1, status: 1, checkInDate: 1, checkOutDate: 1 });

export const Reservation: Model<IReservation> =
  mongoose.models.Reservation || mongoose.model<IReservation>("Reservation", reservationSchema);
