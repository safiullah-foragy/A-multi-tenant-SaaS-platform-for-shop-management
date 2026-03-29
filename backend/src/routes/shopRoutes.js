import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authRequired } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { getMyProfile, getShopList, updateMyProfile, getShopByCashier } from "../controllers/shopController.js";

const router = Router();

router.get("/", asyncHandler(getShopList));
router.get("/by-cashier", authRequired, asyncHandler(getShopByCashier));
router.get("/me", authRequired, asyncHandler(getMyProfile));
router.patch("/me", authRequired, upload.single("shopLogo"), asyncHandler(updateMyProfile));

export default router;
