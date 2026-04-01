import mongoose from 'mongoose';

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
    
    // --- GEWICHTS-LOGIK ---
    unit: { type: String, default: 'g' },     
    unitSize: { type: String, default: '' }, 
    weight: { type: Number, default: 0 }, // Nur die Zahl! (z.B. 500)

    isBundle: { type: Boolean, default: false },
    bundleItems: { type: mongoose.Schema.Types.Mixed }, 
    warranty: { type: String, default: '' },
    returnPolicy: { type: String, default: 'Kein Umtausch bei Lebensmitteln' },
    shippingInfo: { type: String, default: 'Standardversand' },
    isPromotion: { type: Boolean, default: false },
    promotionLabel: { type: String, default: '' },
    oldPrice: { type: Number, default: 0 },
    deliveryType: { type: String, default: 'all' },
    isDeposit: { type: Boolean, default: false },
    depositValue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;