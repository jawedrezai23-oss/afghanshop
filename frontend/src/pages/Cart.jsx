import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getOptimizedImage } from '../utils/cloudinaryHelper';

export default function Cart() {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const loadCart = () => {
    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(items);
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('cart-updated', loadCart);
    return () => window.removeEventListener('cart-updated', loadCart);
  }, []);

  const updateQty = (id, newQty) => {
    const item = cartItems.find(x => x._id === id);
    if (!item) return;
    
    if (newQty > item.countInStock) {
      alert(`Entschuldigung, nur noch ${item.countInStock} Stück auf Lager.`);
      return;
    }
    if (newQty < 1) return;

    const newCart = cartItems.map(item => 
      item._id === id ? { ...item, qty: Number(newQty) } : item
    );
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const removeFromCart = (id) => {
    const newCart = cartItems.filter(item => item._id !== id);
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const itemsPrice = cartItems.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);
  const totalDeposit = cartItems.reduce((acc, item) => {
    const deposit = item.isDeposit ? (Number(item.depositValue) || 0) * item.qty : 0;
    return acc + deposit;
  }, 0);

  const shippingPrice = itemsPrice >= 60 ? 0 : 4.99;
  const totalPrice = itemsPrice + totalDeposit + shippingPrice;
  const missingForFreeShipping = 60 - itemsPrice;

  const hasLocalOnlyItems = cartItems.some(item => item.deliveryType === 'local' || item.deliveryType === 'pickup');

  const checkoutHandler = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (hasLocalOnlyItems) {
      const confirmLocal = window.confirm("Einige Produkte sind nur lokal verfügbar. Wohnst du in Braunau & Umgebung?");
      if (!confirmLocal) return;
    }
    if (!userInfo) {
      navigate('/login?redirect=/shipping');
    } else {
      navigate('/shipping');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-cyan-100 pb-12">
      <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 md:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] font-black uppercase text-cyan-600 tracking-[0.3em] mb-1 italic">Deine Auswahl</p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {t('shopping_cart')} <span className="text-cyan-500">Liste</span>
            </h1>
          </div>
          <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-600 transition-all flex items-center gap-2">
            <span>←</span> Weiter Einkaufen
          </Link>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="text-center p-12 md:p-20 bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🛒</div>
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">{t('empty_cart_msg')}</h2>
            <Link to="/" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-600 transition-all inline-block shadow-xl">
              {t('back_to_shop')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
            
            <div className="lg:col-span-2 space-y-6">
              
              {/* GRATIS VERSAND PROGRESS */}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-end mb-4 relative z-10">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Logistik-Check</p>
                    <h3 className="font-black text-slate-900 text-base md:text-lg tracking-tight uppercase">
                      {itemsPrice >= 60 
                        ? "✨ Kostenloser Versand aktiv!" 
                        : `Noch ${missingForFreeShipping.toFixed(2)}€ bis zum Gratis-Versand`}
                    </h3>
                  </div>
                  <span className="text-cyan-600 font-black text-xs italic">Ziel: 60€</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan-500 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min((itemsPrice / 60) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* PRODUKT LISTE */}
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item._id} className="bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-4 md:gap-6 shadow-sm border border-slate-50 relative">
                    
                    {/* BILD */}
                    <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                      <img 
                        src={getOptimizedImage(item.image, 200)} 
                        className="w-full h-full object-contain rounded-2xl bg-slate-50 border border-slate-100 p-2" 
                        alt={item.name} 
                      />
                    </div>
                    
                    {/* INFO */}
                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="font-black text-slate-800 text-sm md:text-lg leading-tight uppercase tracking-tighter line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                        <span className="text-cyan-600 font-black text-xs">{item.price.toFixed(2)}€</span>
                        {item.weight && (
                           <span className="text-slate-400 font-bold text-[9px] uppercase bg-slate-50 px-2 py-0.5 rounded-md">
                             {String(item.weight).replace(/[^\d.]/g, '')}{item.unit || 'g'}
                           </span>
                        )}
                      </div>
                      {item.isDeposit && (
                        <p className="text-[8px] font-black text-orange-500 uppercase italic mt-1">
                          + {(Number(item.depositValue) * item.qty).toFixed(2)}€ Pfand
                        </p>
                      )}
                    </div>

                    {/* MENGE */}
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                      <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center font-black text-slate-900 hover:bg-white rounded-lg transition-all shadow-sm">−</button>
                      <span className="font-black w-6 text-center text-xs">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item._id, item.qty + 1)} 
                        disabled={item.qty >= item.countInStock}
                        className={`w-8 h-8 flex items-center justify-center font-black transition-all shadow-sm rounded-lg ${item.qty >= item.countInStock ? "text-slate-200" : "text-cyan-600 hover:bg-white"}`}
                      >
                        +
                      </button>
                    </div>

                    {/* PREIS TOTAL PRO ITEM */}
                    <div className="font-black text-slate-900 text-base md:text-lg min-w-[80px] text-right">
                      {(item.price * item.qty).toFixed(2)}€
                    </div>

                    {/* DELETE */}
                    <button onClick={() => removeFromCart(item._id)} className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <span className="text-lg">✕</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY PANEL */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-b-8 border-cyan-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><span className="text-7xl">🛒</span></div>
                
                <p className="text-cyan-400 uppercase text-[9px] font-black tracking-[0.3em] mb-8 italic">Zusammenfassung</p>
                
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">Warenwert</span>
                    <span className="text-base font-black">{itemsPrice.toFixed(2)}€</span>
                  </div>

                  {totalDeposit > 0 && (
                    <div className="flex justify-between items-center text-orange-400">
                      <span className="font-bold text-[9px] uppercase tracking-widest">Pfandwert</span>
                      <span className="text-base font-black">{totalDeposit.toFixed(2)}€</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">Versand</span>
                    <span className={`font-black ${shippingPrice === 0 ? "text-cyan-400 text-[10px]" : "text-base"}`}>
                      {shippingPrice === 0 ? "GRATIS" : `${shippingPrice.toFixed(2)}€`}
                    </span>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-800 flex justify-between items-end mt-4">
                    <div>
                      <span className="font-black text-[9px] uppercase tracking-widest text-cyan-400 block mb-1 italic">Gesamt</span>
                      <span className="text-4xl md:text-5xl font-black tracking-tighter leading-none">{totalPrice.toFixed(2)}<span className="text-lg text-cyan-500 ml-1">€</span></span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={checkoutHandler} 
                  className="w-full bg-cyan-600 text-white py-5 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl active:scale-95"
                >
                  {t('proceed_to_checkout')}
                </button>
                
                <p className="text-center text-[7px] text-slate-500 mt-6 font-bold uppercase tracking-widest">Inkl. gesetzlicher MwSt.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}