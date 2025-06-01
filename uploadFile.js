import multer from "multer";
import path from "path";

// Set lokasi dan nama file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Filter file yang diizinkan
const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new Error("Hanya file gambar .jpeg, .jpg, dan .png yang diperbolehkan.")
    );
  }
};

// Batasi ukuran file (opsional)
const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB
};

// Middleware multer siap digunakan
export const upload = multer({
  storage,
  fileFilter,
  limits,
});
