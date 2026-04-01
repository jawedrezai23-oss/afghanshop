import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB verbunden...');
    
    // Setzt JETZT bei ALLEN Produkten den Lagerbestand auf 20
    const result = await Product.updateMany(
      {}, 
      { $set: { countInStock: 20 } }
    );

    console.log(`${result.modifiedCount} Produkte wurden auf 20 Stück gesetzt.`);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });