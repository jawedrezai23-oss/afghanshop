import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api'; 

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [hasUnpaidOrders, setHasUnpaidOrders] = useState(false); 
  
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.body.dir = (lng === 'fa' || lng === 'ps') ? 'rtl' : 'ltr';
  };

  const updateCartCount = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const count = cartItems.reduce((acc, item) => acc + Number(item.qty), 0);
    setCartCount(count);
  };

  const checkUnpaidOrders = async () => {
    if (userInfo) {
      try {
        const { data } = await api.get('/orders/mine');
        const unpaid = data.some(order => !order.isPaid);
        setHasUnpaidOrders(unpaid);
      } catch (err) {
        console.error("Fehler beim Check der Bestellungen");
      }
    }
  };

  useEffect(() => {
    updateCartCount();
    checkUnpaidOrders();
    window.addEventListener('cart-updated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?search=${keyword}`);
    } else {
      navigate('/');
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white border-b-4 border-cyan-500 sticky top-0 z-50 shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between gap-6">
        
        {/* LOGO BEREICH */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
            {/* Das neue Logo Bild */}
            <img 
              src="/images/logo.png" 
              alt="AfghanShop Logo" 
              className="h-16 w-16 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                Afghan<span className="text-cyan-500">Shop</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 hidden sm:block">
                Spezialitäten
              </span>
            </div>
          </Link>
        </div>

        {/* SUCHLEISTE */}
        <form onSubmit={submitHandler} className="flex-grow max-w-md hidden md:block">
          <div className="relative group">
            <input 
              type="text"
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('search_placeholder') || 'Suchen...'}
              className="w-full bg-slate-50 border-2 border-slate-100 py-2.5 px-5 rounded-full focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-medium text-sm"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-500 hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        <div className="flex items-center gap-4 lg:gap-6">
          
          {/* SPRACH-UMSCHALTER */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-[10px] font-black">
            {['de', 'fa', 'ps'].map((lng) => (
              <button 
                key={lng}
                onClick={() => changeLanguage(lng)} 
                className={`hover:text-cyan-600 uppercase transition-colors ${i18n.language === lng ? 'text-cyan-600' : 'text-slate-400'}`}
              >
                {lng}
              </button>
            ))}
          </div>

          {/* WARENKORB */}
          <Link to="/cart" className="relative group bg-slate-50 p-2.5 rounded-full hover:bg-cyan-50 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 group-hover:text-cyan-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* ADMIN BEREICH */}
          {userInfo && userInfo.isAdmin && (
            <div className="relative group">
              <button className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-500 transition-all">
                Admin
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-[1.5rem] shadow-2xl border border-slate-50 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform translate-y-2 group-hover:translate-y-0 text-slate-700">
                <Link to="/admin/dashboard" className="block px-6 py-2 hover:bg-cyan-50 font-bold text-xs italic uppercase tracking-tighter">Dashboard</Link>
                <Link to="/admin/products" className="block px-6 py-2 hover:bg-cyan-50 font-bold text-xs italic uppercase tracking-tighter">Produkte</Link>
                <Link to="/admin/orders" className="block px-6 py-2 hover:bg-cyan-50 font-bold text-xs italic uppercase tracking-tighter">Bestellungen</Link>
              </div>
            </div>
          )}

          {/* USER ACCOUNT BEREICH */}
          {userInfo ? (
            <div className="relative group flex items-center gap-3 border-l pl-4 border-slate-100">
              <button className="flex items-center gap-2">
                <span className="text-slate-900 font-black text-sm hover:text-cyan-500 transition-colors">
                  {userInfo.name.split(' ')[0]}
                </span>
                {hasUnpaidOrders && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                )}
              </button>

              <div className="absolute right-0 mt-2 top-full w-48 bg-white rounded-[1.5rem] shadow-2xl border border-slate-50 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform translate-y-2 group-hover:translate-y-0 text-slate-700">
                <Link to="/profile" className="flex items-center justify-between px-6 py-2 hover:bg-cyan-50 font-bold text-xs italic uppercase tracking-tighter">
                  Profil
                  {hasUnpaidOrders && <span className="bg-red-500 w-1.5 h-1.5 rounded-full"></span>}
                </Link>
                <button onClick={logoutHandler} className="w-full text-left px-6 py-2 hover:bg-red-50 text-red-500 font-bold text-xs italic uppercase tracking-tighter transition-colors">
                  Abmelden
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="bg-cyan-500 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg">
              Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}