import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Routen importieren
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();

// --- CORS FIX ---
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// --- BILDER-PFAD FIX ---
const __dirname = path.resolve();
// Das hier sorgt dafür, dass http://localhost:5001/uploads/bild.jpg funktioniert
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Falls du Bilder auch direkt im /images Ordner hast:
app.use('/images', express.static(path.join(__dirname, '/images')));

// Sicherstellen, dass der Upload-Ordner existiert
if (!fs.existsSync(path.join(__dirname, '/uploads'))) {
  fs.mkdirSync(path.join(__dirname, '/uploads'));
}

// --- API ROUTEN ---
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// --- DATENBANK ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => console.error('MongoDB Fehler:', err));

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});