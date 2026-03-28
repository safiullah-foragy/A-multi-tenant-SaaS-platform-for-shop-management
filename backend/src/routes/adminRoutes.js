import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authRequired } from "../middleware/auth.js";
import {
  requestCreateAdminOtp,
  verifyAndCreateAdmin,
  listAdmins,
  toggleAdminStatus,
  deleteAdmin
} from "../controllers/adminController.js";

const router = Router();

router.post("/request-create-admin-otp", authRequired, asyncHandler(requestCreateAdminOtp));
router.post("/verify-and-create", authRequired, asyncHandler(verifyAndCreateAdmin));
router.get("/list", authRequired, asyncHandler(listAdmins));

export default router;
router.patch("/:adminId/toggle-status", authRequired, asyncHandler(toggleAdminStatus));

router.delete("/:adminId", authRequired, asyncHandler(deleteAdmin));
