import React from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImage } from '../utils/cloudinaryHelper';

const ProductCard = ({ product, addToCartHandler }) => {
  
  // Bild-URL vorbereiten
  const rawImageUrl = product.image?.startsWith('http') 
    ? product.image 
    : `https://afghanshop-backend.onrender.com${product.image}`;

  // Optimierung (400px reicht für die Card völlig aus und spart Daten)
  const optimizedImageUrl = getOptimizedImage(rawImageUrl, 400);

  const isOutOfStock = product.countInStock === 0;

  return (
    <div className="group bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full relative">
      
      {/* AKTION BADGE */}
      {product.isPromotion && (
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
          <span className="bg-rose-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-widest shadow-lg">
            {product.promotionLabel || 'Aktion'}
          </span>
        </div>
      )}

      {/* BILD-CONTAINER (Responsive Height) */}
      <div className="relative overflow-hidden aspect-[4/5] md:aspect-square bg-slate-50">
        <Link to={`/product/${product._id}`} className="block w-full h-full">
          <img 
            src={optimizedImageUrl}
            alt={product.name} 
            className={`w-full h-full object-contain p-3 md:p-6 group-hover:scale-110 transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-40' : ''}`}
            loading="lazy"
          />
        </Link>
        
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <span className="bg-slate-800 text-white px-2 py-1 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest">
              Ausverkauft
            </span>
          </div>
        )}

        {/* LOKAL-HINWEIS */}
        {!isOutOfStock && product.deliveryType === 'local' && (
          <div className="absolute bottom-2 left-2 bg-orange-500/90 backdrop-blur-sm px-2 py-0.5 md:py-1 rounded-lg text-[7px] md:text-[9px] font-black text-white uppercase shadow-sm">
            📍 Lokal
          </div>
        )}
      </div>

      {/* INFO-BEREICH */}
      <div className="p-3 md:p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <p className="text-[8px] md:text-[10px] font-black text-cyan-600 uppercase tracking-[0.15em] mb-1">
            {product.category || "Spezialität"}
          </p>
          
          <Link to={`/product/${product._id}`}>
            <h3 className={`text-xs md:text-lg font-extrabold leading-tight mb-1 md:mb-2 transition-colors line-clamp-2 ${isOutOfStock ? 'text-slate-400' : 'text-slate-800 group-hover:text-cyan-600'}`}>
              {product.name}
            </h3>
          </Link>
          
          {/* Beschreibung auf Mobile ausblenden für mehr Platz */}
          <p className="text-[10px] md:text-sm text-slate-500 line-clamp-2 mb-3 hidden md:block">
            {product.description}
          </p>
        </div>
        
        {/* PREIS & BUTTON */}
        <div className="flex justify-between items-end mt-2 md:mt-4 pt-2 md:pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
              <span className={`text-sm md:text-2xl font-black ${isOutOfStock ? 'text-slate-300' : 'text-slate-900'}`}>
                {product.price.toFixed(2)}€
              </span>
              
              {product.isPromotion && product.oldPrice > 0 && (
                <span className="text-[8px] md:text-sm text-slate-300 line-through font-bold">
                  {product.oldPrice.toFixed(2)}€
                </span>
              )}
            </div>
            
            {product.isDeposit && (
              <span className="text-[7px] md:text-[9px] font-bold text-orange-600 uppercase mt-0.5">
                + {product.depositValue.toFixed(2)}€ Pfand
              </span>
            )}
          </div>
          
          <button 
            disabled={isOutOfStock}
            onClick={() => addToCartHandler(product)}
            className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl transition-all shadow-md ${isOutOfStock ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-slate-900 active:scale-90 shadow-cyan-100'}`}
            title="In den Warenkorb"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;