import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from '../models/Product.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ MONGO_URI fehlt in .env')
  process.exit(1)
}

const products = [
  {
    name: 'Basmati Reis Afghan',
    image: '/images/basmati.jpg',
    brand: 'Afghan Brand',
    category: 'Lebensmittel',
    description: 'Hochwertiger afghanischer Basmati Reis',
    price: 18.99,
    countInStock: 50,
  },
  {
    name: 'Safran Premium',
    image: '/images/safran.jpg',
    brand: 'Herat Gold',
    category: 'Gewürze',
    description: 'Original afghanischer Safran',
    price: 29.99,
    countInStock: 20,
  },
  {
    name: 'Grüner Tee',
    image: '/images/tea.jpg',
    brand: 'Kabul Tea',
    category: 'Getränke',
    description: 'Traditioneller grüner Tee',
    price: 9.99,
    countInStock: 100,
  },
]

const importData = async () => {
  try {
    await mongoose.connect(MONGO_URI)

    console.log('✅ MongoDB verbunden')

    await Product.deleteMany()
    await Product.insertMany(products)

    console.log('✅ Produkte erfolgreich importiert')
    process.exit()
  } catch (error) {
    console.error('❌ Seeder Fehler:', error)
    process.exit(1)
  }
}

importData()
