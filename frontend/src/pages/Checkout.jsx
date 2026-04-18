import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  
  const [isAnonymousOrder, setIsAnonymousOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(items);
  }, []);

  // --- BERECHNUNGEN ---
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  
  // Getränkepfand Berechnung (falls vorhanden)
  const depositPrice = cartItems.reduce((acc, item) => 
    acc + (item.isDeposit ? (Number(item.depositValue) * item.qty) : 0), 0
  );

  const shippingLimit = 60; // Gratis ab 60€
  const standardShipping = 4.99; // Sonst 4,99€
  
  // Versand ist 0 bei Abholung ODER wenn Warenwert >= 60€
  const currentShipping = isAnonymousOrder ? 0 : (itemsPrice >= shippingLimit ? 0 : standardShipping);
  const totalPrice = itemsPrice + currentShipping + depositPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        orderItems: cartItems,
        shippingAddress: isAnonymousOrder ? { 
            fullName: 'Barzahlung / Abholung', 
            address: 'Abholung im Shop',
            city: 'Braunau',
            postalCode: '5280',
            phone: '000',
            country: 'Austria'
        } : shippingAddress,
        paymentMethod: isAnonymousOrder ? 'Barzahlung' : 'Überweisung', // Hier 'Überweisung' für den QR-Code Trigger
        itemsPrice,
        shippingPrice: currentShipping,
        totalDeposit: depositPrice,
        totalPrice,
        isAnonymousOrder: isAnonymousOrder, 
      };

      // Bestellung an Backend senden
      const { data } = await api.post('/orders', orderData);
      
      localStorage.removeItem('cartItems');
      window.dispatchEvent(new Event("cart-updated"));
      
      // Weiterleitung zur Order-Detail Seite (dort erscheint der korrekte QR-Code)
      navigate(`/order/${data._id}`);
    } catch (error) {
      console.error(error);
      alert("Fehler bei der Bestellung: " + (error.response?.data?.message || "Unbekannter Fehler"));
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-16 px-4 selection:bg-cyan-100">
      <div className="max-w-xl mx-auto bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-slate-100">
        
        <header className="mb-10 text-center">
          <p className="text-[10px] font-black uppercase text-cyan-600 tracking-[0.3em] mb-2 italic">Fast fertig</p>
          <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-tighter text-slate-900">Kasse</h1>
        </header>
        
        {/* Zusammenfassung */}
        <div className="mb-10 p-6 md:p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
            <div className="flex justify-between mb-3">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Warenwert</span>
                <span className="font-black text-slate-800">{itemsPrice.toFixed(2)} €</span>
            </div>

            {depositPrice > 0 && (
              <div className="flex justify-between mb-3">
                  <span className="text-orange-500 font-bold uppercase text-[9px] tracking-widest">Getränkepfand</span>
                  <span className="font-black text-orange-600">{depositPrice.toFixed(2)} €</span>
              </div>
            )}

            <div className="flex justify-between mb-4 pb-4 border-b border-slate-200">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Versandkosten</span>
                <span className={`font-black uppercase text-[10px] ${currentShipping === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {currentShipping === 0 ? 'Kostenlose Lieferung' : `+ ${currentShipping.toFixed(2)} €`}
                </span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-slate-900 font-black uppercase text-[10px] tracking-widest">Gesamtbetrag</span>
                <span className="text-3xl font-black text-cyan-600 tracking-tighter">{totalPrice.toFixed(2)} <span className="text-sm">€</span></span>
            </div>
        </div>

        {/* ABHOLUNG OPTION */}
        <div 
          onClick={() => setIsAnonymousOrder(!isAnonymousOrder)}
          className={`mb-8 border-2 transition-all p-5 rounded-[1.5rem] cursor-pointer flex items-center gap-4 ${isAnonymousOrder ? 'bg-cyan-50 border-cyan-500 shadow-lg shadow-cyan-50' : 'bg-white border-slate-100 hover:border-slate-200'}`}
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isAnonymousOrder ? 'bg-cyan-600 border-cyan-600' : 'bg-white border-slate-300'}`}>
            {isAnonymousOrder && <div className="w-2 h-2 bg-white rounded-full"></div>}
          </div>
          <div className="flex flex-col">
              <span className="font-black text-slate-900 uppercase tracking-tighter text-sm md:text-base">Selbstabholung im Shop</span>
              <span className='text-[10px] font-bold text-cyan-600 uppercase tracking-widest'>Barzahlung vor Ort | Keine Versandkosten</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-8'>
          {!isAnonymousOrder && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className='font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 px-2'>Lieferadresse</h3>
              <input 
                type="text" 
                placeholder="Vollständiger Name" 
                className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300" 
                onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})} 
                required={!isAnonymousOrder} 
              />
              <input 
                type="text" 
                placeholder="Straße und Hausnummer" 
                className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300" 
                onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} 
                required={!isAnonymousOrder} 
              />
              <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="PLZ" 
                    className="p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300" 
                    onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})} 
                    required={!isAnonymousOrder} 
                  />
                  <input 
                    type="text" 
                    placeholder="Stadt" 
                    className="p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300" 
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} 
                    required={!isAnonymousOrder} 
                  />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              className={`w-full p-6 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl ${
                  isAnonymousOrder 
                  ? "bg-cyan-600 text-white shadow-cyan-100 hover:bg-slate-900" 
                  : "bg-slate-900 text-white shadow-slate-200 hover:bg-cyan-600"
              }`}
            >
              {isAnonymousOrder ? "Bestellung bestätigen" : "Zahlungspflichtig bestellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}