import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Owner } from "../models/Owner.js";
import { Admin } from "../models/Admin.js";
import { Cashier } from "../models/Cashier.js";
import { StockManager } from "../models/StockManager.js";

export const authRequired = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const userId = payload.ownerId || payload.userId || payload.id; // Usually ownerId in existing code

    // Check Owner
    let user = await Owner.findById(userId);
    if (user) {
      req.user = user;
      req.user.userType = "owner";
      req.owner = user; // keep legacy behavior
      return next();
    }

    // Check Admin
    user = await Admin.findById(userId);
    if (user) {
      req.user = user;
      req.user.userType = "admin";
      return next();
    }

    // Check Cashier
    user = await Cashier.findById(userId);
    if (user) {
      req.user = user;
      req.user.userType = "cashier";
      return next();
    }

    user = await StockManager.findById(userId);
    if (user) {
      req.user = user;
      req.user.userType = "stockManager";
      return next();
    }

    return res.status(401).json({ message: "Unauthorized" });
  } catch (err) {
    console.error("Auth error", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
