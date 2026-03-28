import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { getProducts, createProduct, getBatches, createBatch, editBatch, editProduct, deleteBatch } from "../controllers/inventoryController.js";

const router = Router();

router.use(authRequired); // Require auth for all inventory routes

router.get("/products", getProducts);
router.post("/products", createProduct);
router.patch("/products/:productId", editProduct);

router.get("/batches", getBatches);
router.post("/batches", createBatch);
router.patch("/batches/:batchId", editBatch);

router.delete("/batches/:batchId", deleteBatch);
export default router;
