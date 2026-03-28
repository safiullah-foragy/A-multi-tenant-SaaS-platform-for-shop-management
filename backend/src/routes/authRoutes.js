import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  loginOwner,
  loginAdmin,
  loginStaff,
  requestPasswordResetOtp,
  requestSignupOtp,
  verifyPasswordResetOtp,
  verifySignupOtp,
  validatePasswordResetOtp,
  requestAdminPasswordResetOtp,
  validateAdminPasswordResetOtp,
  verifyAdminPasswordResetOtp,
  requestStaffPasswordResetOtp,
  validateStaffPasswordResetOtp,
  verifyStaffPasswordResetOtp
} from "../controllers/authController.js";

const router = Router();

router.post("/signup/request-otp", asyncHandler(requestSignupOtp));
router.post("/signup/verify-otp", asyncHandler(verifySignupOtp));
router.post("/login", asyncHandler(loginOwner));
router.post("/admin-login", asyncHandler(loginAdmin));
router.post("/staff-login", asyncHandler(loginStaff));

router.post("/password/request-otp", asyncHandler(requestPasswordResetOtp));
router.post("/password/validate-otp", asyncHandler(validatePasswordResetOtp));
router.post("/password/verify-otp", asyncHandler(verifyPasswordResetOtp));

router.post("/admin-forgot-password/request-otp", asyncHandler(requestAdminPasswordResetOtp));
router.post("/admin-forgot-password/validate-otp", asyncHandler(validateAdminPasswordResetOtp));
router.post("/admin-forgot-password/reset-password", asyncHandler(verifyAdminPasswordResetOtp));

router.post("/staff-forgot-password/request-otp", asyncHandler(requestStaffPasswordResetOtp));
router.post("/staff-forgot-password/validate-otp", asyncHandler(validateStaffPasswordResetOtp));
router.post("/staff-forgot-password/reset-password", asyncHandler(verifyStaffPasswordResetOtp));

export default router;
