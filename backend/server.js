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

// --- DER ULTIMATIVE CORS-FIX ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://afghanshop.vercel.app',
  'https://afghanshop-backend.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Erlaubt: 1. Kein Origin (Postman) 2. Deine festen Domains 3. JEDE Vercel-Subdomain
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith('.vercel.app') || 
      origin.includes('vercel.app')
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

// --- BILDER-PFAD FIX (Lokal & Cloudinary Fallback) ---
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/images', express.static(path.join(__dirname, '/images')));

if (!fs.existsSync(path.join(__dirname, '/uploads'))) {
  fs.mkdirSync(path.join(__dirname, '/uploads'), { recursive: true });
}

// --- NEU: HEALTH-CHECK FÜR MONGO-DB (KEEP-WARM) ---
// Diese Route wird von cron-job.org aufgerufen
app.get('/api/health', async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    res.status(200).json({
      success: true,
      status: isConnected ? 'Backend & DB are awake' : 'DB is connecting...',
      database: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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