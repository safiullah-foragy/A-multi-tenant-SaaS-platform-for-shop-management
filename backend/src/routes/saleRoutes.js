import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createBill, listSales, resolveBarcode } from "../controllers/saleController.js";

const router = Router();

router.use(authRequired);

router.post("/resolve-barcode", asyncHandler(resolveBarcode));
router.post("/create-bill", asyncHandler(createBill));
router.get("/list", asyncHandler(listSales));

export default router;
