import { Router } from "express";
import {
  newReservation,
  getReservations,
  getGuests,
  getMyBookings,
  getSingleReservation,
  updateStatus,
} from "../controllers/reservation.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyToken, optionalVerifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createReservationSchema,
  updateStatusSchema,
} from "../validators/reservation.validator.js";

const router = Router();

// Create reservation (accessible to guests and logged-in customers)
router.post("/", optionalVerifyToken, validate(createReservationSchema), newReservation);

// Customer personal bookings
router.get("/my", verifyToken, getMyBookings);

// Admin list all reservations
router.get("/", verifyToken, authorizeRoles("staff"), getReservations);

// Admin: guest directory aggregated from reservations
router.get("/guests", verifyToken, authorizeRoles("staff"), getGuests);

// Single reservation details (Owner, Admin, or an anonymous guest who knows the reservation ID)
router.get("/:id", optionalVerifyToken, getSingleReservation);

// Status update (Admin)
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles("staff"),
  validate(updateStatusSchema),
  updateStatus
);

export default router;
