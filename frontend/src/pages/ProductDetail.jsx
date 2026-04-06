import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
// --- NEU: IMPORT DES HELPERS ---
import { getOptimizedImage } from '../utils/cloudinaryHelper';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden des Produkts:", err);
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existItem = cartItems.find(x => x._id === product._id);
    
    const pureWeight = product.weight ? parseFloat(String(product.weight).replace(/[^\d.]/g, '')) : 0;

    const itemToAdd = {
      _id: product._id,
      name: product.name,
      // Wir speichern im Warenkorb das optimierte Vorschaubild (200px reicht da völlig)
      image: getOptimizedImage(product.image, 200),
      price: product.price,
      qty: Number(qty),
      countInStock: product.countInStock,
      unit: product.unit || 'g',
      weight: pureWeight, 
      isDeposit: product.isDeposit,
      depositValue: product.depositValue,
      pricePerKg: pureWeight > 0 ? ((product.price / pureWeight) * 1000).toFixed(2) : null
    };

    if (existItem) {
      existItem.qty = Math.min(Number(existItem.qty) + Number(qty), product.countInStock);
    } else {
      cartItems.push(itemToAdd);
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cart-updated"));
    navigate('/cart');
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-500"></div>
    </div>
  );

  if (!product) return (
    <div className="p-20 text-center font-black uppercase text-slate-400">
      Produkt nicht gefunden.
    </div>
  );

  // --- OPTIMIERUNG HIER ---
  const rawImageUrl = product.image?.startsWith('http')
    ? product.image
    : `https://afghanshop-backend.onrender.com${product.image}`;
  
  // Wir nutzen 1000px für die Detailansicht
  const displayImage = getOptimizedImage(rawImageUrl, 1000);

  const discountPercent = product.isPromotion && product.oldPrice > 0
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const renderBasePrice = () => {
    const pureWeight = product.weight ? parseFloat(String(product.weight).replace(/[^\d.]/g, '')) : 0;
    if (pureWeight > 0) {
      const pricePerKg = (product.price / pureWeight) * 1000;
      return (
        <span className="text-[11px] font-bold text-slate-400 block mt-1 uppercase tracking-tighter italic">
          Grundpreis: {pricePerKg.toFixed(2)}€ / kg
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans py-12 px-6 selection:bg-cyan-100">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-600 transition-all flex items-center gap-2 group"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Zurück zum Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="relative rounded-[3.5rem] overflow-hidden bg-white border border-slate-100 shadow-2xl aspect-square group">
            {product.isPromotion && (
              <div className="absolute top-8 right-8 z-20 flex flex-col gap-2 items-end">
                <span className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">
                  🔥 {product.promotionLabel || 'Aktion'}
                </span>
                {discountPercent > 0 && (
                  <span className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                    -{discountPercent}% gespart
                  </span>
                )}
              </div>
            )}
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-700"
              fetchpriority="high" // Damit das Hauptbild bevorzugt geladen wird
            />
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-cyan-600 font-black uppercase tracking-[0.3em] text-[10px] bg-cyan-50 px-5 py-2 rounded-full border border-cyan-100">
                {product.category || 'Lebensmittel'}
              </span>
              {product.countInStock > 0 ? (
                <span className="text-emerald-600 font-black uppercase tracking-[0.3em] text-[10px] bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100">
                  Auf Lager
                </span>
              ) : (
                <span className="text-rose-600 font-black uppercase tracking-[0.3em] text-[10px] bg-rose-50 px-5 py-2 rounded-full border border-rose-100">
                  Ausverkauft
                </span>
              )}
            </div>

            <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-[0.9]">
              {product.name}
            </h1>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium max-w-xl">
              {product.description}
            </p>

            {(product.ingredients || product.nutrition) && (
              <div className="mb-8 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                {product.ingredients && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase text-cyan-600 tracking-widest mb-2 italic underline decoration-cyan-200 underline-offset-4">Zutaten</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-semibold">{product.ingredients}</p>
                  </div>
                )}
                {product.nutrition && (
                  <div className="pt-4 border-t border-slate-50">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 italic">Durchschnittliche Nährwerte pro 100g</h3>
                    <div className="text-xs text-slate-500 whitespace-pre-line leading-relaxed font-bold bg-slate-50 p-4 rounded-2xl">
                      {product.nutrition}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl mb-12 relative overflow-hidden group">
              <div className="flex justify-between items-end mb-10">
                <div className="flex flex-col w-full">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">
                    {product.isPromotion ? 'Dein Aktionspreis' : 'Preis inkl. MwSt.'}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-4">
                    <span className={`text-6xl font-black tracking-tighter ${product.isPromotion ? 'text-rose-600' : 'text-slate-900'}`}>
                      {product.price.toFixed(2)} <span className="text-2xl text-cyan-500">€</span>
                    </span>

                    <div className="ml-auto text-right">
                      <span className="text-xl font-black text-slate-900 uppercase">
                        {product.weight && (
                          <span>
                            {String(product.weight).replace(/[^\d.]/g, '')}
                            {product.unit || 'g'}
                          </span>
                        )}
                        <span className="text-slate-300 font-medium ml-2">Netto</span>
                      </span>
                      {renderBasePrice()}
                    </div>
                  </div>
                </div>
              </div>

              {product.countInStock > 0 ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 font-black text-xl hover:bg-white hover:shadow-sm rounded-xl transition-all">−</button>
                    <span className="font-black w-10 text-center text-lg">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.countInStock, qty + 1))} className="w-12 h-12 font-black text-xl hover:bg-white hover:shadow-sm rounded-xl transition-all">+</button>
                  </div>
                  <button
                    onClick={addToCartHandler}
                    className="flex-grow py-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-500 transition-all shadow-lg active:scale-95"
                  >
                    In den Warenkorb
                  </button>
                </div>
              ) : (
                <div className="w-full bg-slate-100 text-slate-400 py-6 rounded-2xl font-black uppercase text-xs text-center border-2 border-dashed border-slate-200">
                  Momentan leider nicht vorrätig
                </div>
              )}
            </div>

            {/* Icons... */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                <span className="text-2xl block mb-2">🚚</span>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic mb-1">Versand</p>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">{product.shippingInfo || 'Standardversand'}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                <span className="text-2xl block mb-2">💎</span>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic mb-1">Qualität</p>
                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">Selektierte Ware</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                <span className="text-2xl block mb-2">⚠️</span>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic mb-1">Rücknahme</p>
                <p className="text-[10px] font-bold text-slate-800 uppercase leading-tight">Kein Umtausch (Lebensmittel)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}