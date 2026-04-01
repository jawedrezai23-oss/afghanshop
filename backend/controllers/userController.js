import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    User Profil anzeigen
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ 
      _id: user._id, 
      name: user.name, 
      email: user.email, 
      isAdmin: user.isAdmin,
      // Daten aus dem Model an das Frontend senden
      address: user.address || "",
      city: user.city || "",
      postalCode: user.postalCode || "",
      phone: user.phone || ""
    });
  } else {
    res.status(404).json({ message: 'User nicht gefunden' });
  }
};

// @desc    User Profil aktualisieren
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Adressdaten aus req.body übernehmen
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    user.city = req.body.city !== undefined ? req.body.city : user.city;
    user.postalCode = req.body.postalCode !== undefined ? req.body.postalCode : user.postalCode;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

    if (req.body.password) {
      user.password = req.body.password; 
    }

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      address: updatedUser.address,
      city: updatedUser.city,
      postalCode: updatedUser.postalCode,
      phone: updatedUser.phone,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User nicht gefunden' });
  }
};

// @desc    Alle User abrufen (Admin)
export const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

// @desc    User nach ID finden (Admin)
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User nicht gefunden' });
  }
};

// @desc    User löschen (Admin)
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isAdmin) {
      res.status(400).json({ message: 'Admins können nicht gelöscht werden' });
      return;
    }
    await user.deleteOne();
    res.json({ message: 'User erfolgreich gelöscht' });
  } else {
    res.status(404).json({ message: 'User nicht gefunden' });
  }
};

// @desc    User aktualisieren (Admin)
export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
    
    user.address = req.body.address !== undefined ? req.body.address : user.address;
    user.city = req.body.city !== undefined ? req.body.city : user.city;
    user.postalCode = req.body.postalCode !== undefined ? req.body.postalCode : user.postalCode;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    
    const updatedUser = await user.save();
    res.json({ 
      _id: updatedUser._id, 
      name: updatedUser.name, 
      email: updatedUser.email, 
      isAdmin: updatedUser.isAdmin,
      address: updatedUser.address,
      city: updatedUser.city,
      postalCode: updatedUser.postalCode,
      phone: updatedUser.phone
    });
  } else {
    res.status(404).json({ message: 'User nicht gefunden' });
  }
};