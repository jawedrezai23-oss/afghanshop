import express from 'express'; 
import { 
  getProducts, 
  getProductById, 
  deleteProduct, 
  createProduct, 
  updateProduct 
} from '../controllers/productController.js'; 
import { protect, admin } from '../middleware/authMiddleware.js'; 
import Product from '../models/Product.js'; 

const router = express.Router(); 

// --- DIE REINIGUNGSMASCHINE ---
router.get('/fix/cleanup-database', async (req, res) => {
  try {
    const products = await Product.find({});
    let count = 0;

    for (let product of products) {
      if (product.weight) {
        let wStr = String(product.weight).replace(/[^\d.]/g, ''); 
        if (wStr.length >= 4 && wStr.length % 2 === 0) {
          const half = wStr.length / 2;
          if (wStr.substring(0, half) === wStr.substring(half)) wStr = wStr.substring(0, half);
        }
        
        // --- DER SUPER-FIX: Wir nutzen collection.updateOne ---
        // Das umgeht ALLE Validierungen des Modells komplett!
        await Product.collection.updateOne(
          { _id: product._id },
          { $set: { weight: Number(wStr), unit: product.unit || 'g' } }
        );
        count++;
      }
    }
    res.send(`<h1>✅ Fertig!</h1><p>${count} Produkte wurden direkt in der DB geputzt.</p>`);
  } catch (err) {
    res.status(500).send("Fehler: " + err.message);
  }
});

// --- RESTLICHE ROUTEN ---
router.get('/', getProducts);
router.get('/:id', getProductById); 
router.post('/', protect, admin, createProduct); 
router.put('/:id', protect, admin, updateProduct); 
router.delete('/:id', protect, admin, deleteProduct); 

export default router;