import multer from "multer";

const storage = multer.memoryStorage(); // simpan di memory buffer
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg and .png files are allowed"), false);
  }
};

export const upload = multer({ storage, fileFilter });
