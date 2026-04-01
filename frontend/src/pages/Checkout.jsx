import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  
  // States für Abholung & Adressdaten
  const [isAnonymousOrder, setIsAnonymousOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  // Lade Warenkorb beim Start
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(items);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Berechnungen für Preis
      const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
      
      // --- VERSANDKOSTEN ANPASSUNG (60€) ---
      // Wenn Abholung (isAnonymousOrder), dann 0€. 
      // Sonst 60€, außer der Warenkorbwert ist sehr hoch (hier z.B. 150€).
      const shippingLimit = 150; 
      const standardShipping = 60;
      
      const shippingPrice = isAnonymousOrder ? 0 : (itemsPrice >= shippingLimit ? 0 : standardShipping);
      const totalPrice = itemsPrice + shippingPrice;

      const orderData = {
        orderItems: cartItems,
        // DATEN FÜR BACKEND ANPASSEN WENN ABHOLUNG
        shippingAddress: isAnonymousOrder ? { 
            fullName: 'Barzahlung', 
            address: 'Abholung im Shop',
            city: 'Braunau',
            postalCode: '5280',
            phone: '000',
            country: 'Austria'
        } : shippingAddress,
        paymentMethod: isAnonymousOrder ? 'Barzahlung' : 'Sofortüberweisung',
        itemsPrice,
        shippingPrice,
        totalPrice,
        isAnonymousOrder: isAnonymousOrder, 
      };

      // Bestellung an Backend senden
      const { data } = await api.post('/orders', orderData);
      
      // Warenkorb leeren
      localStorage.removeItem('cartItems');
      window.dispatchEvent(new Event("cart-updated"));
      
      // Zur Bestellübersicht navigieren
      navigate(`/order/${data._id}`);
    } catch (error) {
      console.error(error);
      alert("Fehler bei der Bestellung");
    }
  };

  // Hilfsvariablen für die Anzeige
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const currentShipping = isAnonymousOrder ? 0 : (itemsPrice >= 150 ? 0 : 60);

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2rem] shadow-xl">
        <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter text-slate-900">Kasse</h1>
        
        {/* Zusammenfassung vorab */}
        <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex justify-between mb-2">
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Zwischensumme:</span>
                <span className="font-black text-slate-800">{itemsPrice.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between mb-4 pb-4 border-b border-slate-200">
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Versand:</span>
                <span className={`font-black ${currentShipping === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {currentShipping === 0 ? 'GRATIS' : `${currentShipping.toFixed(2)} €`}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-slate-900 font-black uppercase text-xs tracking-widest">Gesamtsumme:</span>
                <span className="text-2xl font-black text-cyan-600">{(itemsPrice + currentShipping).toFixed(2)} €</span>
            </div>
        </div>

        {/* --- CHECKBOX FÜR ABHOLUNG --- */}
        <div className={`mb-8 border-2 transition-all p-6 rounded-[1.5rem] ${isAnonymousOrder ? 'bg-cyan-50 border-cyan-200 shadow-md' : 'bg-white border-slate-100'}`}>
          <label className="flex items-center space-x-4 cursor-pointer">
            <input 
              type="checkbox" 
              checked={isAnonymousOrder}
              onChange={(e) => setIsAnonymousOrder(e.target.checked)}
              className="w-6 h-6 text-cyan-600 rounded focus:ring-cyan-500"
            />
            <div className="flex flex-col">
                <span className="font-black text-lg text-slate-900 uppercase tracking-tight">
                Selbstabholung in Braunau
                </span>
                <span className='text-xs font-bold text-cyan-600 uppercase tracking-widest'>Keine Versandkosten | Barzahlung</span>
            </div>
          </label>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {!isAnonymousOrder && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <h3 className='font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-2'>Lieferadresse</h3>
              <input 
                type="text" 
                placeholder="Vor- und Nachname" 
                className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-bold text-slate-700" 
                onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})} 
                required={!isAnonymousOrder} 
              />
              <input 
                type="text" 
                placeholder="Straße und Hausnummer" 
                className="w-full p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-bold text-slate-700" 
                onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} 
                required={!isAnonymousOrder} 
              />
              <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="PLZ" 
                    className="p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-bold text-slate-700" 
                    onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})} 
                    required={!isAnonymousOrder} 
                  />
                  <input 
                    type="text" 
                    placeholder="Stadt" 
                    className="p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 font-bold text-slate-700" 
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} 
                    required={!isAnonymousOrder} 
                  />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className={`w-full p-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 shadow-xl ${
                isAnonymousOrder 
                ? "bg-cyan-500 text-white shadow-cyan-100 hover:bg-cyan-600" 
                : "bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800"
            }`}
          >
            {isAnonymousOrder ? "Bestellung Bestätigen" : "Zahlungspflichtig bestellen"}
          </button>
        </form>
      </div>
    </div>
  );
}