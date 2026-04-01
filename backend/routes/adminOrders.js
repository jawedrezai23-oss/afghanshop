import express from 'express'
import Order from '../models/Order.js'

const router = express.Router()

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Orders konnten nicht geladen werden' })
  }
})

export default router
