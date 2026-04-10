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

  return (
    <div className="pb-20 bg-slate-50 min-h-screen font-sans">
      
      {!keyword && (
        <header className="relative bg-cyan-700 overflow-hidden min-h-[450px] md:min-h-[600px]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-800 rounded-full -ml-10 -mb-10 opacity-30 blur-2xl"></div>

          <div className="max-w-7xl mx-auto px-6 py-12 md:py-28 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="text-white max-w-2xl text-center md:text-left">
              <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block border border-white/40">
                Original & Frisch importiert
              </span>
              
              <h1 className="text-3xl md:text-6xl font-black mb-4 leading-[1.1] tracking-tighter text-white">
                Beste Afghanische & <span className="text-cyan-200">Iranische Produkte</span>
              </h1>

              <p className="text-white/90 text-base md:text-xl mb-6 font-medium leading-relaxed">
                Entdecken Sie Spezialitäten wie Basmati Reis, Safran und getrocknete Früchte. Kaufen Sie bequem online bei Ihrem Experten in Braunau.
              </p>

              {/* LOKALE LIEFERUNG HIGHLIGHT */}
              <div className="bg-white/10 backdrop-blur-lg border-2 border-yellow-400 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] mb-8 inline-block shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-yellow-400 text-cyan-900 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl shadow-lg shrink-0 animate-bounce">🚚</div>
                  <div>
                    <p className="text-sm md:text-lg font-black text-white leading-tight">
                      In <span className="text-yellow-300">Braunau am Inn</span> & Umgebung
                    </p>
                    <p className="text-[10px] md:text-xs text-white font-bold uppercase tracking-widest mt-1">
                      Zustellung <span className="text-yellow-200">persönlich durch uns!</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center md:justify-start">
                <button 
                  onClick={scrollToProducts}
                  className="bg-white text-cyan-800 px-10 py-3.5 md:px-12 md:py-4 rounded-2xl font-black text-base md:text-lg transition-all shadow-2xl hover:bg-cyan-50 transform hover:-translate-y-1 active:scale-95"
                >
                  Jetzt einkaufen
                </button>
              </div>
            </div>
            
            {/* NEUE HIGHLIGHTS STATT ZWEITEM LOGO */}
            <div className="hidden lg:grid grid-cols-1 gap-4 w-1/3">
               {[
                 { icon: '🌟', title: 'Top Qualität', desc: 'Nur handverlesene Waren' },
                 { icon: '🍃', title: '100% Frisch', desc: 'Direkt aus dem Import' },
                 { icon: '🤝', title: 'Fairer Preis', desc: 'Beste Preise in der Region' }
               ].map((item, index) => (
                 <div key={index} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 flex items-center gap-4 group hover:bg-white/20 transition-all">
                    <div className="text-3xl group-hover:scale-125 transition-transform">{item.icon}</div>
                    <div>
                      <p className="text-white font-black text-sm uppercase tracking-wider">{item.title}</p>
                      <p className="text-cyan-100 text-xs">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-4 mt-10 md:mt-16" ref={productsRef}>
        <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase text-center md:text-left">
              {keyword ? `Ergebnisse für "${keyword}"` : "Unsere Produkte"}
            </h2>
            <div className="h-1.5 w-20 md:w-24 bg-cyan-600 mt-2 mx-auto md:mx-0 rounded-full"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* SORTIERUNG */}
            <div className="relative w-full md:w-auto">
              <select 
                id="sort-products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto appearance-none bg-white border border-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm text-slate-800 outline-none focus:border-cyan-500 shadow-sm cursor-pointer"
              >
                <option value="newest">Zuletzt hinzugefügt</option>
                <option value="price-asc">Preis: Niedrig zu Hoch</option>
                <option value="price-desc">Preis: Hoch zu Niedrig</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="promotion">🔥 Angebote</option>
              </select>
            </div>

            {/* KATEGORIEN - MOBILE OPTIMIERT */}
            <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto px-2" aria-label="Kategorien">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap shadow-sm border ${
                    selectedCategory === cat 
                    ? 'bg-cyan-700 text-white border-cyan-700' 
                    : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-cyan-600"></div>
          </div>
        ) : finalProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-300">
             <p className="text-slate-500 font-bold uppercase">Keine Produkte gefunden</p>
          </div>
        ) : (
          /* PRODUKT GRID - MOBILE 2 SPALTIG */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 mb-24">
            {finalProducts.map((product) => {
              const isOutOfStock = Number(product.countInStock) <= 0;
              const rawImg = product.image && product.image.startsWith('http') 
                ? product.image 
                : `https://afghanshop-backend.onrender.com${product.image}`;
              
              const optimizedImg = getOptimizedImage(rawImg, 400);

              return (
                <article key={product._id} className="group bg-white rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative">
                  
                  {product.isPromotion && (
                    <div className="absolute top-2 right-2 md:top-5 md:right-5 z-20">
                      <span className="bg-rose-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-widest shadow-lg">
                        Aktion
                      </span>
                    </div>
                  )}

                  <Link to={`/product/${product._id}`} className="relative h-40 md:h-72 m-2 md:m-4 overflow-hidden rounded-[1rem] md:rounded-[2.5rem] bg-slate-50 block">
                    <img
                      src={optimizedImg}
                      alt={product.name} 
                      className={`w-full h-full object-contain p-4 md:p-8 transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                      loading="lazy"
                    />
                  </Link>

                  <div className="p-3 md:p-7 pt-0 flex flex-col flex-grow">
                    <Link to={`/product/${product._id}`} className="flex-grow">
                      <p className="text-[8px] md:text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-1">
                        {product.category}
                      </p>
                      <h3 className={`text-xs md:text-lg font-extrabold mb-1 line-clamp-2 ${isOutOfStock ? 'text-slate-400' : 'text-slate-900'}`}>
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex justify-between items-center mt-3 md:mt-6">
                      <div className="flex flex-col">
                        <span className={`text-sm md:text-2xl font-black ${isOutOfStock ? 'text-slate-300' : 'text-slate-900'}`}>
                          {(Number(product.price) || 0).toFixed(2)}€
                        </span>
                        <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase">
                          / {product.unit || 'Stk'}
                        </span>
                      </div>
                      <button 
                        onClick={() => addToCartHandler(product)}
                        disabled={isOutOfStock}
                        className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-[1.25rem] transition-all ${isOutOfStock ? 'bg-slate-100 text-slate-300' : 'bg-cyan-600 text-white hover:bg-cyan-700 active:scale-90 shadow-md'}`}
                      >
                        {addedId === product._id ? '✓' : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
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
        <section className="bg-cyan-600 rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-8 text-center md:text-left">
                Kontakt <span className="text-cyan-900">Daten</span>
              </h2>
              
              <div className="space-y-6">
                {[
                  { icon: '📍', label: 'Anschrift', val: 'Braunau am Inn, Österreich' },
                  { icon: '📞', label: 'Telefon / WhatsApp', val: '+43 69010088854', link: 'tel:+4369010088854' },
                  { icon: '📧', label: 'E-Mail', val: 'info@afghanshop.at', link: 'mailto:info@afghanshop.at' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 justify-center md:justify-start">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">{item.icon}</div>
                    <div>
                      <p className="text-[8px] font-bold uppercase text-cyan-900 tracking-widest">{item.label}</p>
                      {item.link ? (
                        <a href={item.link} className="text-sm md:text-lg font-bold hover:text-cyan-900 transition-colors">{item.val}</a>
                      ) : (
                        <p className="text-sm md:text-lg font-bold">{item.val}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
              <h3 className="text-xl font-black uppercase mb-6">Folgen Sie uns</h3>
              <div className="flex gap-6">
                <a href="https://www.instagram.com/afghn.shop/" target="_blank" rel="noreferrer" className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" className="w-8 h-8" />
                </a>
                <a href="https://wa.me/4369010088854" target="_blank" rel="noreferrer" className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg hover:-translate-y-1 transition-transform">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8" />
                </a>
              </div>
              <p className="mt-8 text-[9px] font-bold uppercase tracking-[0.3em] opacity-80">AFGHAN SHOP BRAUNAU © 2026</p>
            </div>
          </div>
        </section>
      </main>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}