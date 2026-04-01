import express from 'express';
import { 
  addOrder, 
  getOrders, 
  getOrderById, 
  createCheckoutSession, 
  confirmPayment, 
  updateOrderToDelivered,
  getMyOrders,
  deleteOrder,
  updateOrderToPaidAdmin,
  generateInvoice,
  getNextInvoiceNumber 
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- BASIS ROUTEN ---
router.post('/', protect, addOrder);
router.get('/mine', protect, getMyOrders);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/confirm', protect, confirmPayment);

// --- NEU: VORSCHAU DER NÄCHSTEN NUMMER ---
router.get('/next-number', protect, getNextInvoiceNumber);

// --- RECHNUNGS-PDF ---
// FIX: admin entfernt, damit Kunden ihre eigene Rechnung laden können!
router.get('/:id/invoice', protect, generateInvoice); 

// --- EINZELNE BESTELLUNG ---
router.get('/:id', protect, getOrderById);

// --- ADMIN ROUTEN ---
router.get('/', protect, admin, getOrders);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);
router.put('/:id/pay-admin', protect, admin, updateOrderToPaidAdmin);
router.delete('/:id', protect, admin, deleteOrder);

export default router;