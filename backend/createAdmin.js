import mongoose from 'mongoose'
import User from './models/User.js'  // ✅ Importiere das echte Model
import dotenv from 'dotenv'

dotenv.config()

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB connected')

    // Prüfen ob Admin schon existiert
    const adminExists = await User.findOne({ email: 'admin@shop.com' })
    
    if (adminExists) {
      console.log('❌ Admin user already exists')
      console.log('Email:', adminExists.email)
      process.exit(0)
    }

    // Admin mit dem ECHTEN Model erstellen
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@shop.com',
      password: 'admin123', // ✅ Wird automatisch vom Model gehasht!
      isAdmin: true
    })

    console.log('✅ Admin user created successfully:')
    console.log('Email: admin@shop.com')
    console.log('Password: admin123')
    console.log('ID:', admin._id)
    console.log('⚠️  Passwort wird automatisch beim Speichern gehasht')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    process.exit(1)
  }
}

createAdmin()