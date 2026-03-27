import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  loginOwner,
  requestPasswordResetOtp,
  requestSignupOtp,
  verifyPasswordResetOtp,
  verifySignupOtp,
  validatePasswordResetOtp
} from "../controllers/authController.js";

const router = Router();

router.post("/signup/request-otp", asyncHandler(requestSignupOtp));
router.post("/signup/verify-otp", asyncHandler(verifySignupOtp));
router.post("/login", asyncHandler(loginOwner));
router.post("/password/request-otp", asyncHandler(requestPasswordResetOtp));
router.post("/password/validate-otp", asyncHandler(validatePasswordResetOtp));
router.post("/password/verify-otp", asyncHandler(verifyPasswordResetOtp));

export default router;
