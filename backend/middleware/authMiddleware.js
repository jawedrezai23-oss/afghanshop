import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Token verifizieren
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // User holen (ohne Passwort)
      req.user = await User.findById(decoded.id).select('-password');
      
      return next(); 
    } catch (error) {
      // Wenn das Token abgelaufen ist, geben wir eine saubere Antwort statt eines Server-Errors
      if (error.name === 'TokenExpiredError') {
        console.warn("⚠️ Sitzung abgelaufen: User muss sich neu einloggen.");
        return res.status(401).json({ message: 'Sitzung abgelaufen, bitte neu einloggen' });
      }
      
      console.error("Token Error:", error.message);
      return res.status(401).json({ message: 'Nicht autorisiert, Token ungültig' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Nicht autorisiert, kein Token vorhanden' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: 'Zugriff verweigert: Nur für Admins!' });
  }
};