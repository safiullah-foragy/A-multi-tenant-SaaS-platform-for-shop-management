import crypto from "crypto";

export const generateShopId = () => {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `SHOP-${Date.now().toString(36).toUpperCase()}-${randomPart}`;
};
