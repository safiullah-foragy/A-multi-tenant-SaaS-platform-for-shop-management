import { Product } from "../models/Product.js";
import { Batch } from "../models/Batch.js";

const ensureInventoryWriteAccess = (req, res) => {
  if (req.user?.userType === "stockManager" && req.user?.isActive === false) {
    res.status(403).json({
      message: "Your inventory management permission is disabled by admin."
    });
    return false;
  }
  return true;
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ shopId: req.user.shopId }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const createProduct = async (req, res) => {
  try {
    if (!ensureInventoryWriteAccess(req, res)) return;

    const { name, barcode, size } = req.body;
    if (!name) return res.status(400).json({ message: "Product name is required" });

    const newProduct = new Product({
      shopId: req.user.shopId,
      name,
      barcode: barcode || "",
      size: size || ""
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (err) {
    res.status(500).json({ message: "Failed to create product" });
  }
};

export const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ shopId: req.user.shopId })
      .populate("productId", "name barcode size")
      .sort({ createdAt: -1 });
      
    const { Owner } = await import("../models/Owner.js");
    let shopName = "Shop Report";
    let shopLogoPath = "";
    if (req.user.userType === "owner") {
      shopName = req.user.shopName || req.user.name;
      shopLogoPath = req.user.shopLogoPath || "";
    } else {
      const owner = await Owner.findOne({ shopId: req.user.shopId });
      if (owner) {
        shopName = owner.shopName || owner.name;
        shopLogoPath = owner.shopLogoPath || "";
      }
    }

    res.json({ batches, shopName, shopLogoPath });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch batches" });
  }
};

export const createBatch = async (req, res) => {
  try {
    if (!ensureInventoryWriteAccess(req, res)) return;

    const { productId, quantity, mrp, costPrice } = req.body;
    if (!productId || typeof quantity !== 'number' || typeof mrp !== 'number' || typeof costPrice !== 'number') {
      return res.status(400).json({ message: "All fields are required and must be correctly formatted numbers." });
    }

    const newBatch = new Batch({
      shopId: req.user.shopId,
      productId,
      quantity,
      remainingQuantity: quantity,
      mrp,
      costPrice,
      discount: 0,
      createdBy: req.user._id,
      creatorName: req.user.name || "Unknown",
      creatorRole: req.user.userType || "unknown",
      editingPermission: false
    });

    await newBatch.save();
    
    // Return populated
    const populatedBatch = await Batch.findById(newBatch._id).populate("productId", "name barcode");
    res.status(201).json({ message: "Batch created successfully", batch: populatedBatch });
  } catch (err) {
    res.status(500).json({ message: "Failed to create batch" });
  }
};

// Edit Batch
export const editBatch = async (req, res) => {
  try {
    if (!ensureInventoryWriteAccess(req, res)) return;

    const { batchId } = req.params;
    const { quantity, mrp, costPrice, discount } = req.body;
    
    const batch = await Batch.findOne({ _id: batchId, shopId: req.user.shopId });
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    // Ensure permissions
    if (req.user.userType !== 'owner' && req.user.userType !== 'admin' && !batch.editingPermission) {
      return res.status(403).json({ message: "You don't have editing permission for this batch." });
    }

    if (quantity !== undefined) {
      // Calculate remaining quantity adjustment based on old quantity
      const diff = quantity - batch.quantity;
      batch.quantity = quantity;
      batch.remainingQuantity = batch.remainingQuantity + diff;
      if (batch.remainingQuantity < 0) batch.remainingQuantity = 0;
    }
    
    if (mrp !== undefined) batch.mrp = mrp;
    if (costPrice !== undefined) batch.costPrice = costPrice;
    if (discount !== undefined) batch.discount = discount;

    // Allow admin/owner to grant editing permission
    if ((req.user.userType === 'admin' || req.user.userType === 'owner') && req.body.editingPermission !== undefined) {
      batch.editingPermission = req.body.editingPermission;
    }

    // Allow admin/owner to grant editing permission
    if ((req.user.userType === 'admin' || req.user.userType === 'owner') && req.body.editingPermission !== undefined) {
      batch.editingPermission = req.body.editingPermission;
    }

    await batch.save();
    const populatedBatch = await Batch.findById(batch._id).populate("productId", "name barcode");

    res.json({ message: "Batch updated successfully", batch: populatedBatch });
  } catch (err) {
    res.status(500).json({ message: "Failed to update batch" });
  }
};

export const editProduct = async (req, res) => {
  try {
    if (!ensureInventoryWriteAccess(req, res)) return;

    const { productId } = req.params;
    const { name, barcode, size, editingPermission } = req.body;
    
    const product = await Product.findOne({ _id: productId, shopId: req.user.shopId });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Ensure permissions
    if (req.user.userType !== 'owner' && req.user.userType !== 'admin' && !product.editingPermission) {
      return res.status(403).json({ message: "You don't have editing permission for this product." });
    }

    if (name !== undefined) product.name = name;
    if (barcode !== undefined) product.barcode = barcode;
    if (size !== undefined) product.size = size;

    // Allow admin/owner to grant editing permission
    if ((req.user.userType === 'admin' || req.user.userType === 'owner') && editingPermission !== undefined) {
      product.editingPermission = editingPermission;
    }

    await product.save();
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product" });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findOne({ _id: batchId, shopId: req.user.shopId });
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    if (req.user.userType !== 'owner' && req.user.userType !== 'admin') {
      return res.status(403).json({ message: "Only owners and admins can delete batches." });
    }

    await Batch.findByIdAndDelete(batch._id);
    res.json({ message: "Batch deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete batch" });
  }
};
