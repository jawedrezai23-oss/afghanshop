import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// --- CLOUDINARY KONFIGURATION ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});

// --- CLOUDINARY SPEICHER-LOGIK ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'afghanshop_products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// Filter: Nur Bilder erlauben
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Nur Bilder (JPG, PNG, WEBP) sind erlaubt!'));
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// --- DER POST-ENDPUNKT ---
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).send({ message: 'Keine Datei von Cloudinary empfangen' });
  }

  // Schickt den fertigen HTTPS-Link von Cloudinary zurück
  res.send(req.file.path);
});

export default router;