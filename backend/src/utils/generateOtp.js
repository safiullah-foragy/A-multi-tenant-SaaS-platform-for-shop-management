import crypto from "crypto";

export const generateOtp = () => {
  const number = crypto.randomInt(0, 1000000);
  return String(number).padStart(6, "0");
};
