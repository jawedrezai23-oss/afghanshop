import mongoose from 'mongoose';

// Hilfs-Schema für die Kleidungsvarianten
const variantSchema = mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  countInStock: { type: Number, required: true, default: 0 },
});

// Hilfs-Schema für Bundle-Artikel (bessere Struktur als 'Mixed')
const bundleItemSchema = mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String },
  qty: { type: Number, default: 1 }
});

const productSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    images: [String],
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: { type: String, default: '' }, 
    nutrition: { type: String, default: '' },   
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    sold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    
    // --- NEU: KLEIDUNGS-LOGIK ---
    isClothing: { type: Boolean, default: false },
    variants: [variantSchema], // Speichert Array von {size, color, countInStock}

    // --- GEWICHTS-LOGIK ---
    unit: { type: String, default: 'g' },     
    unitSize: { type: String, default: '' }, 
    weight: { type: Number, default: 0 },

    // --- WEITERE OPTIONEN ---
    isBundle: { type: Boolean, default: false },
    bundleItems: [bundleItemSchema], 
    warranty: { type: String, default: '' },
    returnPolicy: { type: String, default: 'Kein Umtausch bei Lebensmitteln' },
    shippingInfo: { type: String, default: 'Standardversand' },
    isPromotion: { type: Boolean, default: false },
    promotionLabel: { type: String, default: '' },
    oldPrice: { type: Number, default: 0 },
    deliveryType: { type: String, default: 'all' },
    isDeposit: { type: Boolean, default: false },
    depositValue: { type: Number, default: 0 },
    isFresh: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;