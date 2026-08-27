import { z } from "zod";

const dateString = (label: string) =>
  z
    .string({ required_error: `${label} is required` })
    .refine((val) => !Number.isNaN(new Date(val).getTime()), {
      message: `${label} is not a valid date`,
    });

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const createReservationSchema = z
  .object({
    guestName: z.string({ required_error: "Guest name is required" }).min(2, "Guest name must be at least 2 characters"),
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
    phone: z.string({ required_error: "Phone number is required" }).min(5, "Phone number is required"),
    room: z.string({ required_error: "Room ID is required" }).min(1, "Room ID is required"),
    checkInDate: dateString("Check-in date"),
    checkOutDate: dateString("Check-out date"),
    numberOfGuests: z
      .number({ required_error: "Number of guests is required" })
      .int("Number of guests must be a whole number")
      .min(1, "Must have at least 1 guest")
      .max(20, "Number of guests is too large"),
    specialRequests: z.string().max(1000, "Special requests are too long").optional().default(""),
    paymentMethod: z.enum(["online", "cash"], {
      required_error: "Payment method is required",
    }),
  })
  .refine((data) => new Date(data.checkOutDate) > new Date(data.checkInDate), {
    message: "Check-out date must be strictly after Check-in date",
    path: ["checkOutDate"],
  })
  .refine((data) => new Date(data.checkInDate) >= startOfToday(), {
    message: "Check-in date cannot be in the past",
    path: ["checkInDate"],
  });

export const updateStatusSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Checked-in", "Checked-out", "Cancelled"], {
    required_error: "Status is required",
  }),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
