import { z } from "zod";

export const createReservationSchema = z
  .object({
    guestName: z.string({ required_error: "Guest name is required" }).min(2, "Guest name must be at least 2 characters"),
    email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
    phone: z.string({ required_error: "Phone number is required" }).min(5, "Phone number is required"),
    room: z.string({ required_error: "Room ID is required" }).min(1, "Room ID is required"),
    checkInDate: z.string({ required_error: "Check-in date is required" }),
    checkOutDate: z.string({ required_error: "Check-out date is required" }),
    numberOfGuests: z
      .number({ required_error: "Number of guests is required" })
      .min(1, "Must have at least 1 guest"),
    specialRequests: z.string().optional().default(""),
    paymentMethod: z.enum(["online", "cash"], {
      required_error: "Payment method is required",
    }),
  })
  .refine(
    (data) => new Date(data.checkOutDate) > new Date(data.checkInDate),
    {
      message: "Check-out date must be strictly after Check-in date",
      path: ["checkOutDate"],
    }
  );

export const updateStatusSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Checked-in", "Checked-out", "Cancelled"], {
    required_error: "Status is required",
  }),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
