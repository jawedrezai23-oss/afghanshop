import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { getOptimizedImage } from '../utils/cloudinaryHelper';

export default function Home() {
  const { t } = useTranslation();

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('cached_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('cached_categories');
    return saved ? JSON.parse(saved) : ['Alle'];
  });

  const [loading, setLoading] = useState(products.length === 0);
  const [addedId, setAddedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Alle');
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
        if (products.length === 0) setLoading(true);
        const { data } = await api.get('/products');
        
        const uniqueCategories = ['Alle', ...new Set(data
          .map(p => p.category)
          .filter(cat => cat && cat.trim() !== '')
        )];

        setProducts(data);
        setCategories(uniqueCategories);
        
        localStorage.setItem('cached_products', JSON.stringify(data));
        localStorage.setItem('cached_categories', JSON.stringify(uniqueCategories));
        
        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [products.length]);

  const getProcessedProducts = () => {
    let filtered = products.filter(p => {
      const matchesKeyword = p.name.toLowerCase().includes(keyword.toLowerCase()) || 
                            p.category?.toLowerCase().includes(keyword.toLowerCase());
      const matchesCategory = selectedCategory === 'Alle' || p.category === selectedCategory;
      return matchesKeyword && matchesCategory;
    });

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
          image: getOptimizedImage(product.image, 200),
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-600" role="status">
        <span className="sr-only">Laden...</span>
      </div>
    </div>
  );

  return (
    <div className="pb-20 bg-slate-50 min-h-screen font-sans">
      
      {!keyword && (
        <header className="relative bg-cyan-700 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-800 rounded-full -ml-10 -mb-10 opacity-30 blur-2xl"></div>

          <div className="max-w-7xl mx-auto px-6 py-16 md:py-28 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-white max-w-2xl text-center md:text-left">
              <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block border border-white/40">
                Original & Frisch importiert
              </span>
              
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tighter text-white">
                Beste Afghanische & <span className="text-cyan-200">Iranische Produkte</span>
              </h1>

              <p className="text-white text-lg md:text-xl mb-6 font-medium leading-relaxed">
                Entdecken Sie Spezialitäten wie Basmati Reis, Grüne und Schwarze Tees, Safran, getrocknete Früchte und vieles mehr. Kaufen Sie bequem online.
              </p>

              <div className="bg-white/10 backdrop-blur-lg border-2 border-yellow-400 p-6 rounded-[2.5rem] mb-10 inline-block shadow-[0_0_20px_rgba(250,204,21,0.4)] animate-[pulse-slow_3s_infinite]">
                <div className="flex items-center gap-5 text-left">
                  <div className="bg-yellow-400 text-cyan-900 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg shrink-0 animate-bounce" aria-hidden="true">🚚</div>
                  <div>
                    <p className="text-base md:text-lg font-black text-white leading-tight">
                      In <span className="text-yellow-300 underline decoration-2 underline-offset-4">Braunau am Inn</span> und Umgebung
                    </p>
                    <p className="text-xs text-white font-bold uppercase tracking-widest mt-1.5">
                      erfolgt die Zustellung <span className="text-yellow-200">persönlich durch uns!</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center md:justify-start">
                <button 
                  onClick={scrollToProducts}
                  className="bg-white text-cyan-800 px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-2xl hover:bg-cyan-50 transform hover:-translate-y-1 active:scale-95"
                >
                  Jetzt einkaufen
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block w-1/3 text-center">
               <div className="bg-white/10 backdrop-blur-xl p-12 rounded-[5rem] border border-white/20 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-700">
                  <div className="absolute inset-0 bg-cyan-400/5 group-hover:bg-cyan-400/10 transition-colors"></div>
                  <div className="relative z-10 flex flex-col items-center w-full">
                    {/* HIER DAS LOGO BILD */}
                    <img 
                      src="/images/logo.png" 
                      alt="AfghanShop Logo" 
                      className="h-32 w-32 object-contain mb-4"
                      fetchpriority="high"
                      loading="eager"
                      decoding="async"
                    />
                    <div className="h-1.5 w-20 bg-cyan-200 rounded-full mb-6"></div>
                    <p className="text-white font-black uppercase tracking-[0.4em] text-[15px] drop-shadow-md text-center">Dein Afghanshop</p>
                  </div>
               </div>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-4 mt-16" ref={productsRef}>
        <div className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              {keyword ? `Ergebnisse für "${keyword}"` : "Unsere Produkte"}
            </h2>
            <div className="h-1.5 w-24 bg-cyan-600 mt-3 rounded-full"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-auto">
              <label htmlFor="sort-products" className="sr-only">Produkte sortieren nach</label>
              <select 
                id="sort-products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto appearance-none bg-white border border-slate-300 px-6 py-2.5 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:border-cyan-500 shadow-sm cursor-pointer"
              >
                <option value="newest">Zuletzt hinzugefügt</option>
                <option value="price-asc">Preis: Niedrig zu Hoch</option>
                <option value="price-desc">Preis: Hoch zu Niedrig</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="promotion">🔥 Aktuelle Angebote</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto" aria-label="Kategorien">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  aria-pressed={selectedCategory === cat}
                  className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shadow-sm ${
                    selectedCategory === cat 
                    ? 'bg-cyan-700 text-white shadow-cyan-200' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {finalProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-300">
             <p className="text-slate-600 font-bold text-xl uppercase">Keine Produkte in dieser Auswahl</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-24">
            {finalProducts.map((product) => {
              const isOutOfStock = Number(product.countInStock) <= 0;
              const rawImg = product.image && product.image.startsWith('http') 
                ? product.image 
                : `https://afghanshop-backend.onrender.com${product.image}`;
              
              const optimizedImg = getOptimizedImage(rawImg, 500);

              return (
                <article key={product._id} className="group bg-white rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col relative">
                  
                  {product.isPromotion && (
                    <div className="absolute top-5 right-5 z-30">
                      <span className="bg-rose-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl animate-pulse">
                        {product.promotionLabel || 'Aktion'}
                      </span>
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="absolute top-5 left-5 z-30">
                      <span className="bg-slate-700 text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl border border-white/20">
                        Ausverkauft
                      </span>
                    </div>
                  )}

                  <Link to={`/product/${product._id}`} className="relative h-72 m-4 overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-slate-100 to-white block" aria-label={`${product.name} Details ansehen`}>
                    <img
                      src={optimizedImg}
                      alt="" 
                      className={`w-full h-full object-contain p-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-2 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-cyan-900/0 group-hover:bg-cyan-900/5 transition-colors duration-500"></div>
                  </Link>

                  <div className="p-7 pt-2 flex flex-col flex-grow">
                    <Link to={`/product/${product._id}`} className="flex-grow">
                      <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-1">
                        {product.category} 
                        {product.deliveryType === 'local' && <span className="text-orange-600 ml-2">| 📍 Lokale Lieferung</span>}
                      </p>
                      <h3 className={`text-lg font-extrabold mb-2 transition-colors leading-snug ${isOutOfStock ? 'text-slate-500' : 'text-slate-900 group-hover:text-cyan-700'}`}>
                        {product.name}
                      </h3>
                      {product.isDeposit && (
                        <p className="text-[9px] font-black text-orange-700 uppercase tracking-tighter mb-2">
                          + {product.depositValue.toFixed(2)}€ Pfand
                        </p>
                      )}
                    </Link>
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Preis</span>
                        <div className="flex items-end gap-1.5">
                          <span className={`text-2xl font-black ${isOutOfStock ? 'text-slate-400' : 'text-slate-900'}`}>
                            {(Number(product.price) || 0).toFixed(2)}€
                          </span>
                          {!isOutOfStock && (
                            <span className="text-[10px] font-black text-cyan-600 uppercase mb-1.5 tracking-tighter">
                              / {product.unit || 'Stk'}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => addToCartHandler(product)}
                        disabled={isOutOfStock}
                        aria-label={`${product.name} zum Warenkorb hinzufügen`}
                        className={`w-14 h-14 flex items-center justify-center rounded-[1.25rem] transition-all shadow-lg ${isOutOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-100 active:scale-90'}`}
                      >
                        {addedId === product._id ? (
                          <span className="text-xl" aria-hidden="true">✓</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        
        {/* KONTAKT SECTION */}
        <section className="bg-cyan-600 rounded-[3rem] p-10 md:p-16 text-slate-900 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full -mr-20 -mt-20 opacity-40 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-700 rounded-full -ml-10 -mb-10 opacity-30 blur-2xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 text-slate-900">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 text-center md:text-left text-white">
                Kontakt <span className="text-cyan-900">Daten</span>
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-xl border border-white/40 shadow-sm" aria-hidden="true">📍</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-900 tracking-widest mb-1">Anschrift</p>
                    <p className="text-lg font-bold text-white">Braunau am Inn, Österreich</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-xl border border-white/40 shadow-sm" aria-hidden="true">📞</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-900 tracking-widest mb-1">Telefon / WhatsApp</p>
                    <a href="tel:+4369010088854" className="text-lg font-bold text-white hover:text-cyan-900 transition-colors">+43 69010088854</a>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-xl border border-white/40 shadow-sm" aria-hidden="true">📧</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-900 tracking-widest mb-1">E-Mail</p>
                    <a href="mailto:infoafghanshop@aol.com" className="text-lg font-bold text-white hover:text-cyan-900 transition-colors">infoafghanshop@aol.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/10 backdrop-blur-md border border-white/30 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-black uppercase mb-2 text-white">Folgen Sie uns</h3>
              <p className="text-slate-900 mb-10 text-sm font-medium">Immer aktuell informiert</p>
              
              <div className="flex gap-8">
                <a href="https://www.instagram.com/afghn.shop/" target="_blank" rel="noreferrer" aria-label="Folge uns auf Instagram" className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl hover:-translate-y-2 transition-all transform active:scale-95">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" className="w-10 h-10" />
                </a>
                <a href="https://www.facebook.com/afghanshop" target="_blank" rel="noreferrer" aria-label="Besuche uns auf Facebook" className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl hover:-translate-y-2 transition-all transform active:scale-95">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" className="w-10 h-10" />
                </a>
                <a href="https://wa.me/4369010088854" target="_blank" rel="noreferrer" aria-label="Kontaktiere uns via WhatsApp" className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl hover:-translate-y-2 transition-all transform active:scale-95">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-10 h-10" />
                </a>
              </div>
              <footer className="mt-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/80">AFGHAN SHOP BRAUNAU © 2026</p>
              </footer>
            </div>
          </div>
        </section>
      </main>
      
      <style>{`
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(250,204,21,0.4); }
          50% { transform: scale(1.03); box-shadow: 0 0 35px rgba(250,204,21,0.6); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}