import { Router } from "express";
import {
  getRooms,
  getSingleRoom,
  createNewRoom,
  updateExistingRoom,
  removeRoom,
  uploadRoomImage,
} from "../controllers/room.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { uploadImage } from "../middlewares/upload.middleware.js";
import { createRoomSchema, updateRoomSchema } from "../validators/room.validator.js";

const router = Router();

router.get("/", getRooms);
router.get("/:id", getSingleRoom);

// Admin: upload a room image to Cloudinary, returns a hosted URL
router.post(
  "/upload-image",
  verifyToken,
  authorizeRoles("staff"),
  uploadImage.single("image"),
  uploadRoomImage
);

// Protected routes (Admin & Staff)
router.post(
  "/",
  verifyToken,
  authorizeRoles("staff"),
  validate(createRoomSchema),
  createNewRoom
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("staff"),
  validate(updateRoomSchema),
  updateExistingRoom
);
router.delete("/:id", verifyToken, authorizeRoles("staff"), removeRoom);

export default router;
