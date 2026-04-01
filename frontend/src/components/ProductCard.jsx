import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, addToCartHandler }) => {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full relative">
      
      {/* NEU: AKTION BADGE (Oben Rechts) */}
      {product.isPromotion && (
        <div className="absolute top-3 right-3 z-20 animate-pulse">
          <span className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg border border-white/20">
            {product.promotionLabel || 'Aktion'}
          </span>
        </div>
      )}

      {/* Bild-Container */}
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <Link to={`/product/${product._id}`}>
          <img 
            src={product.image?.startsWith('http') ? product.image : `http://localhost:5001${product.image}`} 
            alt={product.name} 
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${product.countInStock === 0 ? 'grayscale opacity-50' : ''}`}
          />
        </Link>
        
        {product.countInStock === 0 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-red-600 uppercase shadow-sm z-10">
            Ausverkauft
          </div>
        )}

        {/* LOKAL-HINWEIS AUF DEM BILD */}
        {product.deliveryType === 'local' && (
          <div className="absolute bottom-3 left-3 bg-orange-500/90 backdrop-blur px-2 py-1 rounded-md text-[9px] font-black text-white uppercase shadow-sm z-10">
            📍 Nur Braunau & Umgeb.
          </div>
        )}
      </div>

      {/* Info-Container */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              {product.category || "Allgemein"}
            </p>
          </div>
          
          <Link to={`/product/${product._id}`}>
            <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">
            {product.description}
          </p>
        </div>
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Preis</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900">
                  {product.price.toFixed(2)} €
                </span>
                
                {product.isPromotion && product.oldPrice > 0 && (
                  <span className="text-sm text-slate-300 line-through font-bold">
                    {product.oldPrice.toFixed(2)} €
                  </span>
                )}
              </div>
              {/* NEU: PFAND-HINWEIS AUF DER KARTE */}
              {product.isDeposit && (
                <span className="text-[9px] font-black text-orange-500 uppercase">
                  + {product.depositValue.toFixed(2)} € Pfand
                </span>
              )}
            </div>
          </div>
          
          <button 
            disabled={product.countInStock === 0}
            onClick={() => addToCartHandler(product)}
            className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-90 shadow-md shadow-slate-200"
            title="In den Warenkorb"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;