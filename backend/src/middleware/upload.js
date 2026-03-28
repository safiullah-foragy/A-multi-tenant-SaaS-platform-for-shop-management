import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      return cb(new Error("Only png, jpeg and webp images are allowed"));
    }
    return cb(null, true);
  }
});
