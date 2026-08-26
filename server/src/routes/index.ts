import { Router } from "express";
import authRoutes from "./auth.routes.js";
import roomRoutes from "./room.routes.js";
import reservationRoutes from "./reservation.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import paymentRoutes from "./payment.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/reservations", reservationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/payments", paymentRoutes);

export default router;
