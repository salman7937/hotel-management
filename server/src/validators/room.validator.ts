import { z } from "zod";

export const createRoomSchema = z.object({
  roomNumber: z.string({ required_error: "Room number is required" }).min(1, "Room number is required"),
  roomType: z.enum(["Standard", "Deluxe", "Executive", "Family", "Suite"], {
    required_error: "Room type is required",
  }),
  description: z.string({ required_error: "Description is required" }).min(5, "Description must be at least 5 characters"),
  pricePerNight: z.number({ required_error: "Price per night is required" }).min(0, "Price cannot be negative"),
  maxGuests: z.number({ required_error: "Max guests capacity is required" }).min(1, "Room must fit at least 1 guest"),
  bedType: z.string().optional().default("Single"),
  facilities: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  isAvailable: z.boolean().optional().default(true),
});

export const updateRoomSchema = createRoomSchema.partial();

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
