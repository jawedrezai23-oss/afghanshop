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

// --- DER KORRIGIERTE CORS-FIX ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://afghanshop.vercel.app',
  'https://afghanshop-backend.onrender.com',
  'https://afghanshop.at',        // Korrekt mit Anführungszeichen und Komma
  'https://www.afghanshop.at'      // Korrekt mit Anführungszeichen
];

app.use(cors({
  origin: function (origin, callback) {
    // Erlaubt Anfragen ohne Origin (wie Postman) oder wenn die URL in der Liste steht
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      console.log("CORS blockiert diese URL:", origin); 
      callback(new Error('Nicht erlaubt durch CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/images', express.static(path.join(__dirname, '/images')));

if (!fs.existsSync(path.join(__dirname, '/uploads'))) {
  fs.mkdirSync(path.join(__dirname, '/uploads'), { recursive: true });
}

// --- OPTIMIERTER MINI-HEALTH-CHECK ---
app.get('/api/health', (req, res) => {
  res.status(200).send('ok'); 
});

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