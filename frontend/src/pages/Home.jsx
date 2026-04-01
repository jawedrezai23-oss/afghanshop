import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function Home() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  
  // --- GEÄNDERT: Standardmäßig nach Name sortieren ---
  const [sortBy, setSortBy] = useState('name-asc'); 

  const productsRef = useRef(null);
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const keyword = queryParams.get('search') || '';

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/products');
        setProducts(data);

        const uniqueCategories = ['Alle', ...new Set(data
          .map(p => p.category)
          .filter(cat => cat && cat.trim() !== '')
        )];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- KOMBINIERTE FILTER- & SORTIER-LOGIK ---
  const getProcessedProducts = () => {
    // 1. Filtern
    let filtered = products.filter(p => {
      const matchesKeyword = p.name.toLowerCase().includes(keyword.toLowerCase()) || 
                            p.category?.toLowerCase().includes(keyword.toLowerCase());
      const matchesCategory = selectedCategory === 'Alle' || p.category === selectedCategory;
      return matchesKeyword && matchesCategory;
    });

    // 2. Sortieren
    return filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'promotion') return (b.isPromotion ? 1 : 0) - (a.isPromotion ? 1 : 0);
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });
  };

  const finalProducts = getProcessedProducts();

  const addToCartHandler = (product) => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existItem = cartItems.find(x => x._id === product._id);
    const stock = Number(product.countInStock);

    if (existItem) {
      if (existItem.qty < stock) {
        existItem.qty += 1;
      } else {
        alert("Maximale Lagerkapazität erreicht!");
        return;
      }
    } else {
      if (stock > 0) {
        cartItems.push({ 
          ...product,
          qty: 1 
        });
      } else {
        alert("Produkt nicht mehr auf Lager!");
        return;
      }
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cart-updated"));
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1000);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-600"></div>
    </div>
  );

  return (
    <div className="pb-20 bg-slate-50 min-h-screen font-sans">
      
      {!keyword && (
        <div className="relative bg-cyan-600 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-700 rounded-full -ml-10 -mb-10 opacity-30 blur-2xl"></div>

          <div className="max-w-7xl mx-auto px-6 py-16 md:py-28 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-white max-w-2xl text-center md:text-left">
              <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block border border-white/30">
                Original & Frisch importiert
              </span>
              
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tighter text-white">
                Beste Afghanische & <span className="text-cyan-200">Iranische Produkte</span>
              </h1>

              <p className="text-cyan-50 text-lg md:text-xl mb-6 opacity-95 font-medium leading-relaxed">
                Entdecken Sie Spezialitäten wie Basmati Reis, Grüne und Schwarze Tees, Safran, getrocknete Früchte und vieles mehr. Kaufen Sie bequem online.
              </p>

              <div className="bg-white/20 backdrop-blur-lg border-2 border-yellow-400 p-6 rounded-[2.5rem] mb-10 inline-block shadow-[0_0_20px_rgba(250,204,21,0.4)] animate-[pulse-slow_3s_infinite]">
                <div className="flex items-center gap-5 text-left">
                  <div className="bg-yellow-400 text-cyan-900 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg shrink-0 animate-bounce">🚚</div>
                  <div>
                    <p className="text-base md:text-lg font-black text-white leading-tight">
                      In <span className="text-yellow-300 underline decoration-2 underline-offset-4">Braunau am Inn</span> und Umgebung
                    </p>
                    <p className="text-xs text-cyan-100 font-bold uppercase tracking-widest mt-1.5">
                      erfolgt die Zustellung <span className="text-white">persönlich durch uns!</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center md:justify-start">
                <button 
                  onClick={scrollToProducts}
                  className="bg-white text-cyan-700 px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-2xl hover:bg-cyan-50 transform hover:-translate-y-1 active:scale-95"
                >
                  Jetzt einkaufen
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block w-1/3 text-center">
               <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[5rem] border border-white/20 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-700">
                  <div className="absolute inset-0 bg-cyan-400/5 group-hover:bg-cyan-400/10 transition-colors"></div>
                  <div className="relative z-10 flex flex-col items-center w-full">
                    <div className="h-1.5 w-20 bg-cyan-200 rounded-full mb-6"></div>
                    <p className="text-white font-black uppercase tracking-[0.4em] text-[15px] drop-shadow-md text-center">Dein Afghanshop</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-16" ref={productsRef}>
        
        {/* HEADER & FILTER ZEILE */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              {keyword ? `Ergebnisse für "${keyword}"` : "Unsere Produkte"}
            </h2>
            <div className="h-1.5 w-24 bg-cyan-500 mt-3 rounded-full"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* SORTIERUNG DROPDOWN */}
            <div className="relative w-full md:w-auto">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto appearance-none bg-white border border-slate-200 px-6 py-2.5 rounded-2xl font-bold text-sm text-slate-700 outline-none focus:border-cyan-500 shadow-sm cursor-pointer"
              >
                <option value="newest">Zuletzt hinzugefügt</option>
                <option value="price-asc">Preis: Niedrig zu Hoch</option>
                <option value="price-desc">Preis: Hoch zu Niedrig</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="promotion">🔥 Aktuelle Angebote</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {/* KATEGORIEN BUTTONS */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shadow-sm ${
                    selectedCategory === cat 
                    ? 'bg-cyan-600 text-white shadow-cyan-200' 
                    : 'bg-white text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {finalProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <p className="text-slate-500 font-bold text-xl uppercase">Keine Produkte in dieser Auswahl</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-24">
            {finalProducts.map((product) => {
              const isOutOfStock = Number(product.countInStock) <= 0;

              return (
                <div key={product._id} className="group bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col relative">
                  
                  {product.isPromotion && (
                    <div className="absolute top-5 right-5 z-30">
                      <span className="bg-rose-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl animate-pulse">
                        {product.promotionLabel || 'Aktion'}
                      </span>
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="absolute top-5 left-5 z-30">
                      <span className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl border border-white/20">
                        Ausverkauft
                      </span>
                    </div>
                  )}

                  <Link to={`/product/${product._id}`} className="relative h-72 m-4 overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-slate-50 to-white block">
                    <img
                      src={product.image && product.image.startsWith('http') ? product.image : `http://localhost:5001${product.image}`}
                      alt={product.name}
                      className={`w-full h-full object-contain p-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-2 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                    />
                    <div className="absolute inset-0 bg-cyan-900/0 group-hover:bg-cyan-900/5 transition-colors duration-500"></div>
                  </Link>

                  <div className="p-7 pt-2 flex flex-col flex-grow">
                    <Link to={`/product/${product._id}`} className="flex-grow">
                      <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">
                        {product.category} 
                        {product.deliveryType === 'local' && <span className="text-orange-500 ml-2">| 📍 Lokale Lieferung</span>}
                      </p>
                      <h3 className={`text-lg font-extrabold mb-2 transition-colors leading-snug ${isOutOfStock ? 'text-slate-400' : 'text-slate-800 group-hover:text-cyan-600'}`}>
                        {product.name}
                      </h3>
                      {product.isDeposit && (
                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-tighter mb-2">
                          + {product.depositValue.toFixed(2)}€ Pfand
                        </p>
                      )}
                    </Link>
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Preis</span>
                        <div className="flex items-end gap-1.5">
                          <span className={`text-2xl font-black ${isOutOfStock ? 'text-slate-300' : 'text-slate-900'}`}>
                            {(Number(product.price) || 0).toFixed(2)}€
                          </span>
                          {!isOutOfStock && (
                            <span className="text-[10px] font-black text-cyan-500 uppercase mb-1.5 tracking-tighter">
                              / {product.unit || 'Stk'}
                            </span>
                          )}
                          {product.isPromotion && product.oldPrice > 0 && (
                            <span className="text-sm text-slate-300 line-through font-bold mb-0.5 ml-1">
                              {product.oldPrice.toFixed(2)}€
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => addToCartHandler(product)}
                        disabled={isOutOfStock}
                        className={`w-14 h-14 flex items-center justify-center rounded-[1.25rem] transition-all shadow-lg ${isOutOfStock ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-cyan-100 active:scale-90'}`}
                      >
                        {addedId === product._id ? (
                          <span className="text-xl">✓</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* KONTAKT SEKTION */}
        <div className="bg-cyan-500 rounded-[3rem] p-10 md:p-16 text-slate-900 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400 rounded-full -mr-20 -mt-20 opacity-40 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600 rounded-full -ml-10 -mb-10 opacity-30 blur-2xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 text-slate-900">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 text-center md:text-left">
                Kontakt <span className="text-white">Daten</span>
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-xl border border-white/40 shadow-sm">📍</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-800 tracking-widest mb-1">Anschrift</p>
                    <p className="text-lg font-bold">Braunau am Inn, Österreich</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-xl border border-white/40 shadow-sm">📞</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-800 tracking-widest mb-1">Telefon / WhatsApp</p>
                    <a href="tel:+4369010088854" className="text-lg font-bold hover:text-white transition-colors">+43 69010088854</a>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-xl border border-white/40 shadow-sm">📧</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-800 tracking-widest mb-1">E-Mail</p>
                    <a href="mailto:infoafghanshop@aol.com" className="text-lg font-bold hover:text-white transition-colors">infoafghanshop@aol.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/10 backdrop-blur-md border border-white/30 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-black uppercase mb-2">Folgen Sie uns</h3>
              <p className="text-slate-800 mb-10 text-sm font-medium">Immer aktuell informiert</p>
              
              <div className="flex gap-8">
                <a href="https://www.instagram.com/afghn.shop/" target="_blank" rel="noreferrer" className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl hover:-translate-y-2 transition-all transform active:scale-95">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" className="w-10 h-10" />
                </a>
                <a href="https://www.facebook.com/afghanshop" target="_blank" rel="noreferrer" className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl hover:-translate-y-2 transition-all transform active:scale-95">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" className="w-10 h-10" />
                </a>
                <a href="https://wa.me/4369010088854" target="_blank" rel="noreferrer" className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl hover:-translate-y-2 transition-all transform active:scale-95">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-10 h-10" />
                </a>
              </div>
              <div className="mt-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-800/60">AFGHAN SHOP BRAUNAU © 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(250,204,21,0.4); }
          50% { transform: scale(1.03); box-shadow: 0 0 35px rgba(250,204,21,0.6); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}