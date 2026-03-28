import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authRequired } from "../middleware/auth.js";
import {
  requestStaffOtp,
  verifyAndCreateStaff,
  listStaff,
  toggleStaffStatus,
  deleteStaff
} from "../controllers/staffController.js";

const router = Router();

router.post("/request-otp", authRequired, asyncHandler(requestStaffOtp));
router.post("/verify-and-create", authRequired, asyncHandler(verifyAndCreateStaff));
router.get("/list", authRequired, asyncHandler(listStaff));
router.patch("/:staffId/toggle-status", authRequired, asyncHandler(toggleStaffStatus));
router.delete("/:staffId", authRequired, asyncHandler(deleteStaff));

export default router;
