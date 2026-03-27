import { z } from "zod";
import { Owner } from "../models/Owner.js";

const updateProfileSchema = z.object({
  shopName: z.string().min(2).max(80).optional(),
  shopLocation: z.string().max(160).optional()
});

export const getShopList = async (req, res) => {
  const shops = await Owner.find({}, { shopId: 1, shopName: 1, shopLogoPath: 1, shopLocation: 1, gmail: 1 }).sort({ createdAt: -1 });

  return res.status(200).json({ shops });
};

export const getMyProfile = async (req, res) => {
  const owner = req.owner;

  return res.status(200).json({
    owner: {
      id: owner._id,
      phone: owner.phone,
      gmail: owner.gmail,
      shopId: owner.shopId,
      shopName: owner.shopName,
      shopLogoPath: owner.shopLogoPath,
      shopLocation: owner.shopLocation
    }
  });
};

export const updateMyProfile = async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid profile data" });
  }

  const owner = req.owner;
  const { shopName, shopLocation } = parsed.data;

  if (typeof shopName !== "undefined") {
    owner.shopName = shopName;
  }

  if (typeof shopLocation !== "undefined") {
    owner.shopLocation = shopLocation;
  }

  if (req.file) {
    owner.shopLogoPath = `/uploads/${req.file.filename}`;
  }

  await owner.save();

  return res.status(200).json({
    message: "Profile updated",
    owner: {
      id: owner._id,
      phone: owner.phone,
      gmail: owner.gmail,
      shopId: owner.shopId,
      shopName: owner.shopName,
      shopLogoPath: owner.shopLogoPath,
      shopLocation: owner.shopLocation
    }
  });
};
