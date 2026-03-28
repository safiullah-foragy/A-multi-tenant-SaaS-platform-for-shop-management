import { Batch } from "../models/Batch.js";
import { Product } from "../models/Product.js";
import { Sale } from "../models/Sale.js";
import { BillCounter } from "../models/BillCounter.js";

const ensureCashierCanSell = (req, res) => {
  if (req.user?.userType !== "cashier") {
    res.status(403).json({ message: "Only cashiers can create sales." });
    return false;
  }

  if (req.user?.isActive === false) {
    res.status(403).json({ message: "Your cashier account is inactive." });
    return false;
  }

  return true;
};

const normalizeBarcode = (value) => (value || "").trim();

const findProductByBarcode = async (shopId, barcode) => {
  return Product.findOne({ shopId, barcode: normalizeBarcode(barcode) });
};

const getBatchesForProduct = async (shopId, productId) => {
  return Batch.find({
    shopId,
    productId,
    remainingQuantity: { $gt: 0 }
  })
    .sort({ createdAt: 1, _id: 1 })
    .select("_id productId remainingQuantity mrp discount");
};

const allocateQuantityFromBatches = (batches, quantity) => {
  const allocations = [];
  let remaining = quantity;

  for (const batch of batches) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, batch.remainingQuantity);
    const mrp = Number(batch.mrp) || 0;
    const discount = Number(batch.discount) || 0;
    const total = take * mrp - take * discount;

    allocations.push({
      batchId: batch._id,
      productId: batch.productId,
      quantity: take,
      mrp,
      discount,
      total
    });
    remaining -= take;
  }

  return { allocations, unallocated: remaining };
};

const nextBillNumber = async () => {
  const counter = await BillCounter.findOneAndUpdate(
    {},
    {
      $inc: { value: 1 }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return counter.value;
};

export const resolveBarcode = async (req, res) => {
  if (!ensureCashierCanSell(req, res)) return;

  const barcode = normalizeBarcode(req.body?.barcode);
  const quantity = Number(req.body?.quantity || 1);

  if (!barcode) {
    return res.status(400).json({ message: "Barcode is required." });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be a positive integer." });
  }

  const product = await findProductByBarcode(req.user.shopId, barcode);
  if (!product) {
    return res.status(404).json({ message: "No product found for this barcode." });
  }

  const fifoBatches = await getBatchesForProduct(req.user.shopId, product._id);
  if (fifoBatches.length === 0) {
    return res.status(400).json({ message: "No stock available for this barcode." });
  }

  const availableQuantity = fifoBatches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
  if (availableQuantity < quantity) {
    return res.status(400).json({ message: `Insufficient stock. Available quantity is ${availableQuantity}.` });
  }

  const oldestBatch = fifoBatches[0];
  const mrp = Number(oldestBatch.mrp) || 0;
  const discount = Number(oldestBatch.discount) || 0;
  const total = quantity * mrp - quantity * discount;

  return res.json({
    row: {
      shopId: req.user.shopId,
      productId: product._id,
      productBarcode: barcode,
      batchId: oldestBatch._id,
      mrp,
      quantity,
      discount,
      total,
      seller: req.user.name || req.user.gmail || "Cashier",
      sellingDate: new Date().toISOString(),
      availableQuantity
    }
  });
};

export const createBill = async (req, res) => {
  if (!ensureCashierCanSell(req, res)) return;

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (items.length === 0) {
    return res.status(400).json({ message: "At least one bill row is required." });
  }

  const preparedRows = [];

  for (const item of items) {
    const barcode = normalizeBarcode(item?.barcode);
    const quantity = Number(item?.quantity);

    if (!barcode) {
      return res.status(400).json({ message: "Each row must contain a barcode." });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: `Quantity must be a positive integer for barcode ${barcode}.` });
    }

    const product = await findProductByBarcode(req.user.shopId, barcode);
    if (!product) {
      return res.status(404).json({ message: `No product found for barcode ${barcode}.` });
    }

    const fifoBatches = await getBatchesForProduct(req.user.shopId, product._id);
    const availableQuantity = fifoBatches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);
    if (availableQuantity < quantity) {
      return res.status(400).json({ message: `Insufficient stock for barcode ${barcode}. Available quantity is ${availableQuantity}.` });
    }

    const { allocations, unallocated } = allocateQuantityFromBatches(fifoBatches, quantity);
    if (unallocated > 0) {
      return res.status(400).json({ message: `Unable to allocate full quantity for barcode ${barcode}.` });
    }

    preparedRows.push({
      barcode,
      productId: product._id,
      allocations
    });
  }

  const billNumber = await nextBillNumber();
  const sellingDate = new Date();
  const seller = req.user.name || req.user.gmail || "Cashier";

  const docs = [];
  for (const row of preparedRows) {
    for (const allocation of row.allocations) {
      const updatedBatch = await Batch.findOneAndUpdate(
        {
          _id: allocation.batchId,
          shopId: req.user.shopId,
          remainingQuantity: { $gte: allocation.quantity }
        },
        {
          $inc: { remainingQuantity: -allocation.quantity }
        },
        { new: true }
      );

      if (!updatedBatch) {
        return res.status(409).json({ message: "Stock changed while creating bill. Please try again." });
      }

      docs.push({
        billNumber,
        shopId: req.user.shopId,
        productBarcode: row.barcode,
        batchId: allocation.batchId,
        productId: row.productId,
        mrp: allocation.mrp,
        quantity: allocation.quantity,
        discount: allocation.discount,
        total: allocation.total,
        seller,
        sellingDate,
        cashierId: req.user._id
      });
    }
  }

  const savedRows = await Sale.insertMany(docs);
  const billTotal = savedRows.reduce((sum, row) => sum + row.total, 0);

  return res.status(201).json({
    message: "Bill created successfully.",
    billNumber,
    rows: savedRows,
    total: billTotal
  });
};

export const listSales = async (req, res) => {
  const sales = await Sale.find({ shopId: req.user.shopId })
    .populate("productId", "name barcode size")
    .sort({ sellingDate: -1, createdAt: -1 })
    .limit(400);

  const grouped = new Map();
  for (const row of sales) {
    const key = String(row.billNumber);
    if (!grouped.has(key)) {
      grouped.set(key, {
        billNumber: row.billNumber,
        shopId: row.shopId,
        seller: row.seller,
        sellingDate: row.sellingDate || row.createdAt,
        rows: [],
        total: 0
      });
    }

    const group = grouped.get(key);
    group.rows.push(row);
    group.total += row.total;
  }

  return res.json({
    sales: Array.from(grouped.values()).sort((a, b) => b.billNumber - a.billNumber)
  });
};
