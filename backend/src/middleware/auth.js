import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { Owner } from "../models/Owner.js";

export const authRequired = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const owner = await Owner.findById(payload.ownerId);

    if (!owner) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.owner = owner;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
