import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getOptimizedImage } from '../utils/cloudinaryHelper';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  // --- NEU: STATE FÜR GEWÄHLTE VARIANTE ---
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        
        // Wenn es Kleidung ist und Varianten hat, wähle die erste automatisch vor
        if (data.isClothing && data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden des Produkts:", err);
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    // Validierung für Kleidung
    if (product.isClothing && !selectedVariant) {
      alert("Bitte wähle eine Größe/Farbe aus!");
      return;
    }

    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Eindeutige ID für den Warenkorb (ProduktID + Varianten-Info)
    const cartId = product.isClothing 
      ? `${product._id}-${selectedVariant.size}-${selectedVariant.color}`
      : product._id;

    const existItem = cartItems.find(x => x.cartId === cartId);
    
    const pureWeight = product.weight ? parseFloat(String(product.weight).replace(/[^\d.]/g, '')) : 0;

    const itemToAdd = {
      _id: product._id,
      cartId: cartId, // Wichtig für Varianten-Trennung im Warenkorb
      name: product.name,
      image: getOptimizedImage(product.image, 200),
      price: product.price,
      qty: Number(qty),
      countInStock: product.isClothing ? selectedVariant.countInStock : product.countInStock,
      unit: product.unit || 'g',
      weight: pureWeight, 
      isDeposit: product.isDeposit,
      depositValue: product.depositValue,
      pricePerKg: pureWeight > 0 ? ((product.price / pureWeight) * 1000).toFixed(2) : null,
      // Varianten-Details mitschicken
      variant: product.isClothing ? { size: selectedVariant.size, color: selectedVariant.color } : null
    };

    if (existItem) {
      const maxStock = product.isClothing ? selectedVariant.countInStock : product.countInStock;
      existItem.qty = Math.min(Number(existItem.qty) + Number(qty), maxStock);
    } else {
      cartItems.push(itemToAdd);
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cart-updated"));
    navigate('/cart');
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-cyan-600"></div>
    </div>
  );

  if (!product) return (
    <div className="p-20 text-center font-black uppercase text-slate-300">
      Produkt nicht gefunden.
    </div>
  );

  const rawImageUrl = product.image?.startsWith('http')
    ? product.image
    : `https://afghanshop-backend.onrender.com${product.image}`;
  
  const displayImage = getOptimizedImage(rawImageUrl, 1000);

  const discountPercent = product.isPromotion && product.oldPrice > 0
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  // Prüfen ob die aktuell gewählte Variante vorrätig ist
  const currentInStock = product.isClothing 
    ? (selectedVariant ? selectedVariant.countInStock : 0)
    : product.countInStock;

  return (
    <div className="bg-slate-50 min-h-screen font-sans py-6 md:py-12 px-4 md:px-6 selection:bg-cyan-100">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 md:mb-10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-600 transition-all flex items-center gap-2 group"
        >
          <span className="text-lg transition-transform group-hover:-translate-x-1">←</span> Zurück
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">
          
          {/* BILD-BEREICH */}
          <div className="relative rounded-[2rem] md:rounded-[3.5rem] overflow-hidden bg-white border border-slate-100 shadow-xl aspect-square">
            {product.isPromotion && (
              <div className="absolute top-4 right-4 md:top-8 md:right-8 z-20 flex flex-col gap-2 items-end">
                <span className="bg-rose-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl">
                  🔥 {product.promotionLabel || 'Aktion'}
                </span>
                {discountPercent > 0 && (
                  <span className="bg-slate-900 text-white px-3 py-1.5 rounded-lg md:rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-widest shadow-lg">
                    -{discountPercent}%
                  </span>
                )}
              </div>
            )}
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-contain p-4 md:p-12 hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* INFO-BEREICH */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <span className={`font-black uppercase tracking-widest text-[9px] md:text-[10px] px-4 py-1.5 rounded-full border ${product.isClothing ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-cyan-600 bg-cyan-50 border-cyan-100'}`}>
                {product.category || 'Spezialität'}
              </span>
              {currentInStock > 0 ? (
                <span className="text-emerald-600 font-black uppercase tracking-widest text-[9px] md:text-[10px] bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                  {product.isClothing ? 'Größe verfügbar' : 'Auf Lager'}
                </span>
              ) : (
                <span className="text-rose-600 font-black uppercase tracking-widest text-[9px] md:text-[10px] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">
                  Ausverkauft
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-6xl font-black text-slate-900 mb-4 md:mb-6 tracking-tighter uppercase leading-tight md:leading-[0.9]">
              {product.name}
            </h1>
            
            <p className="text-slate-500 text-sm md:text-lg mb-6 md:mb-8 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* --- NEU: VARIANTEN AUSWAHL FÜR KLEIDUNG --- */}
            {product.isClothing && product.variants && product.variants.length > 0 && (
              <div className="mb-8 p-6 bg-white rounded-[2rem] border border-indigo-100 shadow-sm">
                <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-4 italic">Verfügbare Varianten:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 
                        ${selectedVariant === v 
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg scale-105' 
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-indigo-200'}`}
                    >
                      {v.size} {v.color && `- ${v.color}`}
                      <span className="block text-[8px] opacity-60 mt-1">
                        {v.countInStock > 0 ? `${v.countInStock} Stk.` : 'Leer'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PREIS-CARD */}
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl mb-8 md:mb-12">
              <div className="flex justify-between items-end mb-6 md:mb-10">
                <div className="flex flex-col w-full">
                  <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">
                    {product.isPromotion ? 'Aktionspreis' : 'Preis inkl. MwSt.'}
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className={`text-4xl md:text-6xl font-black tracking-tighter ${product.isPromotion ? 'text-rose-600' : 'text-slate-900'}`}>
                      {product.price.toFixed(2)}<span className="text-xl md:text-2xl text-cyan-600 ml-1">€</span>
                    </span>

                    <div className="text-right">
                      <span className="text-lg md:text-xl font-black text-slate-900 uppercase">
                        {!product.isClothing && product.weight && (
                          <span>
                            {String(product.weight).replace(/[^\d.]/g, '')}{product.unit || 'g'}
                          </span>
                        )}
                        {product.isClothing && selectedVariant && (
                          <span className="text-indigo-600">
                            Größe {selectedVariant.size}
                          </span>
                        )}
                      </span>
                      {!product.isClothing && (
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-400 block mt-1 uppercase tracking-tight italic">
                          {product.weight ? `Grundpreis: ${((product.price / parseFloat(String(product.weight).replace(/[^\d.]/g, ''))) * 1000).toFixed(2)}€ / kg` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {currentInStock > 0 ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 font-black text-lg hover:bg-white rounded-lg transition-all">−</button>
                    <span className="font-black w-8 text-center">{qty}</span>
                    <button onClick={() => setQty(Math.min(currentInStock, qty + 1))} className="w-10 h-10 font-black text-lg hover:bg-white rounded-lg transition-all">+</button>
                  </div>
                  <button
                    onClick={addToCartHandler}
                    className={`flex-grow py-4 md:py-5 text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] transition-all shadow-lg active:scale-95 ${product.isClothing ? 'bg-indigo-600 hover:bg-slate-900' : 'bg-cyan-600 hover:bg-slate-900'}`}
                  >
                    In den Warenkorb
                  </button>
                </div>
              ) : (
                <div className="w-full bg-slate-50 text-slate-400 py-4 rounded-xl font-black uppercase text-[10px] text-center border-2 border-dashed border-slate-200">
                  {product.isClothing ? 'Diese Variante ist ausverkauft' : 'Nicht vorrätig'}
                </div>
              )}
            </div>

            {/* ZUTATEN / NÄHRWERTE (Nur für Lebensmittel) */}
            {!product.isClothing && (product.ingredients || product.nutrition) && (
              <div className="mb-8 space-y-4">
                {product.ingredients && (
                  <div className="p-5 md:p-8 bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100">
                    <h3 className="text-[10px] font-black uppercase text-cyan-600 tracking-widest mb-3 italic">Zutaten</h3>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-bold">{product.ingredients}</p>
                  </div>
                )}
                {product.nutrition && (
                  <div className="p-5 md:p-8 bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] text-white">
                    <h3 className="text-[10px] font-black uppercase text-cyan-400 tracking-widest mb-4 italic">Nährwerte pro 100g</h3>
                    <div className="text-[10px] md:text-xs font-mono opacity-90 whitespace-pre-line leading-loose">
                      {product.nutrition}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SERVICE ICONS */}
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {[
                { i: '🚚', t: 'Versand', v: product.shippingInfo || 'Standard' },
                { i: '💎', t: 'Qualität', v: product.isClothing ? 'Premium Textil' : 'Selektiert' },
                { i: '🔄', t: 'Rückgabe', v: product.isClothing ? '14 Tage' : 'Kein Umtausch' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 text-center shadow-sm">
                  <span className="text-xl md:text-2xl block mb-1">{item.i}</span>
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter mb-1">{item.t}</p>
                  <p className="text-[8px] md:text-[10px] font-bold text-slate-800 uppercase leading-tight">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}