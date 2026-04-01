import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile,
  getUsers, 
  deleteUser,
  updateUser,
  getUserById
} from '../controllers/userController.js';
import { loginUser, registerUser } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- ÖFFENTLICHE ROUTEN ---
router.post('/login', loginUser);
router.post('/register', registerUser);

// --- GESCHÜTZTE ROUTEN (Profil für jeden User) ---
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// --- ADMIN ROUTEN ---
router
  .route('/')
  .get(protect, admin, getUsers); // Alle User anzeigen

router
  .route('/:id')
  .get(protect, admin, getUserById)   // Einzelnen User laden
  .delete(protect, admin, deleteUser) // User löschen
  .put(protect, admin, updateUser);   // User bearbeiten (z.B. Admin-Rechte vergeben)

export default router;