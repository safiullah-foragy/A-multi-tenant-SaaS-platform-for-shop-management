import { z } from "zod";
import { Owner } from "../models/Owner.js";
import { createClient } from "@supabase/supabase-js";
import path from "path";

const supabase = createClient(
  "https://dmpokqidduzmyztknwzj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcG9rcWlkZHV6bXl6dGtud3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODgwNjksImV4cCI6MjA4NjU2NDA2OX0.9E5LaKBjPKmoJRgw7FfZ2MHLYDDQ2geW4nO8mO3rkb8"
);

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
    // Delete old image if it exists and is from Supabase
    if (owner.shopLogoPath && owner.shopLogoPath.includes("supabase.co")) {
      try {
        const oldFileUrl = new URL(owner.shopLogoPath);
        const parts = oldFileUrl.pathname.split("/");
        // Assuming path is like /storage/v1/object/public/Shops_images/filename.ext
        // We need the filename which is the last part
        const filename = parts.pop();
        if (filename) {
          const { error: removeError } = await supabase.storage.from("Shops_images").remove([filename]);
          if (removeError) {
            console.error("Failed to delete old image from Supabase:", removeError);
          }
        }
      } catch (err) {
        console.error("Error parsing old image URL:", err);
      }
    }

    // Upload new image
    const safeExt = path.extname(req.file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("Shops_images")
      .upload(uniqueName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ message: "Image upload failed" });
    }

    const { data: publicUrlData } = supabase.storage
      .from("Shops_images")
      .getPublicUrl(uploadData.path);

    owner.shopLogoPath = publicUrlData.publicUrl;
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
