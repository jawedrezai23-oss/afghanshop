import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (product) => {
    setCartItems(prev => {
      const exist = prev.find(item => item._id === product._id)

      if (exist) {
        // PRÜFUNG: Haben wir das Limit erreicht?
        if (exist.qty >= product.countInStock) {
          alert(`Entschuldigung, es sind nur ${product.countInStock} Stück verfügbar.`)
          return prev // Keine Änderung am Warenkorb
        }

        return prev.map(item =>
          item._id === product._id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }

      // Falls Produkt noch nicht im Warenkorb, prüfe ob überhaupt 1 Stück da ist
      if (product.countInStock > 0) {
        return [...prev, { ...product, qty: 1 }]
      } else {
        alert("Dieses Produkt ist leider ausverkauft.")
        return prev
      }
    })
  }

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item._id !== id))
  }

  const updateQty = (id, newQty, maxStock) => {
    setCartItems(prev => 
      prev.map(item => 
        item._id === id 
          ? { ...item, qty: Math.min(newQty, maxStock) } 
          : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty, // Neu hinzugefügt, falls du im Warenkorb die Menge ändern willst
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}