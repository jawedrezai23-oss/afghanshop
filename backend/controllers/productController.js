import Product from '../models/Product.js';

// @desc    Alle Produkte abrufen
export const getProducts = async (req, res) => {
  try {
    // Kurzer Fix für alte Datenleichen
    await Product.updateMany({ bundleItems: "" }, { $set: { bundleItems: [] } });

    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Einzelnes Produkt abrufen
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Produkt nicht gefunden' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Produkt löschen
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Produkt gelöscht' });
    } else {
      res.status(404).json({ message: 'Produkt nicht gefunden' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Produkt erstellen (Admin)
export const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: 'Beispiel Name',
      price: 0,
      user: req.user._id, 
      image: '/images/sample.jpg',
      brand: 'Beispiel Marke',
      category: 'Beispiel Kategorie',
      countInStock: 0,
      numReviews: 0,
      description: 'Beispiel Beschreibung',
      // NEU Initialisiert:
      ingredients: '',
      nutrition: '',
      weight: 0,
      isBundle: false,
      bundleItems: []
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Produkt aktualisieren (Admin)
export const updateProduct = async (req, res) => {
  const {
    name, price, description, image, images, brand,
    category, countInStock, unit, unitSize, isBundle,
    bundleItems, warranty, returnPolicy, shippingInfo,
    isPromotion, promotionLabel, oldPrice, deliveryType,
    isDeposit, depositValue,
    // NEUE FELDER AUS DEM FRONTEND:
    ingredients, nutrition, weight 
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Standard Felder
      product.name = name || product.name;
      product.description = description || product.description;
      product.image = image || product.image;
      product.images = images || product.images;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.unit = unit || product.unit;
      product.unitSize = unitSize || product.unitSize;
      product.warranty = warranty || product.warranty;
      product.returnPolicy = returnPolicy || product.returnPolicy;
      product.shippingInfo = shippingInfo || product.shippingInfo;
      product.promotionLabel = promotionLabel || product.promotionLabel;
      product.deliveryType = deliveryType || product.deliveryType;

      // NEU: Zuweisung der Lebensmittel-Infos
      product.ingredients = ingredients || product.ingredients;
      product.nutrition = nutrition || product.nutrition;

      // Numerische Felder & Booleans
      product.price = price ?? product.price;
      product.countInStock = countInStock ?? product.countInStock;
      product.oldPrice = oldPrice ?? product.oldPrice;
      product.depositValue = depositValue ?? product.depositValue;
      
      // NEU: Gewicht als Zahl für Grundpreis
      product.weight = weight ?? product.weight;
      
      product.isBundle = isBundle ?? product.isBundle;
      product.isPromotion = isPromotion ?? product.isPromotion;
      product.isDeposit = isDeposit ?? product.isDeposit;

      // Bundle Logik
      if (product.isBundle) {
          product.bundleItems = bundleItems || product.bundleItems;
      } else {
          product.bundleItems = [];
      }

      const updatedProduct = await product.save({ validateBeforeSave: false });
      
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Produkt nicht gefunden' });
    }
  } catch (error) {
    console.error('BACKEND UPDATE ERROR:', error.message);
    res.status(500).json({ message: 'Update fehlgeschlagen: ' + error.message });
  }
};

// @desc    Top Produkte
export const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(3);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};