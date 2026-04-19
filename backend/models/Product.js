import mongoose from 'mongoose';

const variantSchema = mongoose.Schema({
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  countInStock: { type: Number, default: 0 },
});

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
    
    // Kleidung & Varianten
    isClothing: { type: Boolean, default: false },
    variants: [variantSchema],

    unit: { type: String, default: 'g' },     
    unitSize: { type: String, default: '' }, 
    weight: { type: Number, default: 0 },

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