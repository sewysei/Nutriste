import multer from "multer";
import fs from "fs";

// Buat folder uploads/ jika belum ada
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
// Set lokasi dan nama file upload
const storage = multer.memoryStorage();

// Middleware multer siap digunakan
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, JPG, and PNG files are allowed"), false);
    }
    cb(null, true);
  },
});
