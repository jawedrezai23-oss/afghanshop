import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// Absoluter Pfad zum Upload-Ordner
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, '/uploads');

// Erstelle den Ordner automatisch, falls er nicht existiert (mit rekursiver Sicherheit)
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Konfiguration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    // Erstellt einen sauberen Dateinamen: image-zeitstempel.jpg
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Filter: Nur Bilder erlauben (JPG, JPEG, PNG, WEBP)
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
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// Der POST-Endpunkt
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Keine Datei empfangen' });
  }

  // WICHTIG: Ersetzt Backslashes durch Slashes für die URL-Kompatibilität
  const safePath = `/${req.file.path.replace(/\\/g, '/')}`;
  
  res.send(safePath);
});

export default router;