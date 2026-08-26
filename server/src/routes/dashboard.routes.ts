import { Router } from "express";
import { getStats } from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/stats", verifyToken, authorizeRoles("staff"), getStats);

export default router;
