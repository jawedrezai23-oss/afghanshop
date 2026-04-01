import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        oldPrice: { type: Number }, 
        deposit: { type: Number, required: true, default: 0 }, 
        // --- NEU: Damit das Gewicht in der Bestellung landet ---
        weight: { type: Number }, 
        unit: { type: String, default: 'g' },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true },
      country: { type: String, default: 'Austria' },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Stripe', 'Überweisung', 'Barzahlung'],
      default: 'Stripe',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    invoiceNumber: { type: Number, required: true, unique: true },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    totalDeposit: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    trackingNumber: { type: String, default: '' },
    carrier: { type: String, default: '' },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;