import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api'; 

export default function Navbar() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [hasUnpaidOrders, setHasUnpaidOrders] = useState(false); 
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const userInfoStr = localStorage.getItem('userInfo');
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

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
  }, [userInfo]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?search=${keyword}`);
      setIsMobileSearchOpen(false);
    } else {
      navigate('/');
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white border-b-4 border-cyan-600 sticky top-0 z-50 shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4 h-20 md:h-24 flex items-center justify-between gap-4">
        
        {/* LOGO BEREICH */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-12 w-12 md:h-16 md:w-16 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                Afghan<span className="text-cyan-600">Shop</span>
              </span>
              <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 hidden xs:block">
                Braunau am Inn
              </span>
            </div>
          </Link>
        </div>

        {/* SUCHLEISTE (DESKTOP) */}
        <form onSubmit={submitHandler} className="flex-grow max-w-md hidden lg:block">
          <div className="relative group">
            <input 
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Suchen nach Reis, Tee, Safran..."
              className="w-full bg-slate-50 border-2 border-slate-200 py-2.5 px-5 rounded-full focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-600 transition-all font-medium text-sm text-slate-800"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* NAVIGATION ICONS & USER */}
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          
          {/* ADMIN PANEL DROPDOWN */}
          {userInfo && userInfo.isAdmin && (
            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-cyan-600 transition-all shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">Admin Panel</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <p className="px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Verwaltung</p>
                <Link to="/admin/dashboard" className="block px-4 py-2.5 hover:bg-cyan-50 font-bold text-[10px] uppercase tracking-wider text-slate-700">Dashboard</Link>
                <Link to="/admin/products" className="block px-4 py-2.5 hover:bg-cyan-50 font-bold text-[10px] uppercase tracking-wider text-slate-700">Produkte</Link>
                <Link to="/admin/orders" className="block px-4 py-2.5 hover:bg-cyan-50 font-bold text-[10px] uppercase tracking-wider text-slate-700">Bestellungen</Link>
                <Link to="/admin/users" className="block px-4 py-2.5 hover:bg-cyan-50 font-bold text-[10px] uppercase tracking-wider text-slate-700">Benutzer</Link>
              </div>
            </div>
          )}

          {/* MOBILE SUCHE TRIGGER */}
          <button 
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="lg:hidden p-2 text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* WARENKORB */}
          <Link to="/cart" className="relative bg-slate-100 p-2 md:p-2.5 rounded-full hover:bg-cyan-50 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] md:text-[10px] font-black min-w-[18px] h-[18px] md:w-5 md:h-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* USER DROPDOWN */}
          {userInfo ? (
            <div className="relative group flex items-center gap-2 md:gap-3 border-l pl-2 md:pl-4 border-slate-200">
              <button className="flex items-center gap-1 md:gap-2">
                <span className="text-slate-900 font-black text-xs md:text-sm">
                  {userInfo.name.split(' ')[0]}
                </span>
                {hasUnpaidOrders && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                )}
              </button>
              
              <div className="absolute right-0 mt-2 top-full w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <p className="px-6 pb-2 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2">Mein Konto</p>
                
                <Link to="/profile" className="flex items-center justify-between px-6 py-2.5 hover:bg-cyan-50 font-bold text-[10px] uppercase tracking-wider text-slate-700">
                  Mein Profil {hasUnpaidOrders && <span className="bg-red-600 w-1.5 h-1.5 rounded-full"></span>}
                </Link>
                
                {/* GEFIXT: Link geht jetzt zur Bestellübersicht /orderhistory */}
                <Link to="/orderhistory" className="block px-6 py-2.5 hover:bg-cyan-50 font-bold text-[10px] uppercase tracking-wider text-slate-700">
                  Bestellungen
                </Link>

                <div className="pt-2 mt-2 border-t border-slate-50">
                  <button onClick={logoutHandler} className="w-full text-left px-6 py-2.5 hover:bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-wider transition-colors">
                    Abmelden
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="bg-cyan-600 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest">
              Login
            </Link>
          )}

        </div>
      </div>

      {/* MOBILE SUCHLEISTE */}
      {isMobileSearchOpen && (
        <div className="lg:hidden px-4 pb-4 animate-in slide-in-from-top duration-300">
          <form onSubmit={submitHandler} className="relative">
            <input 
              type="text"
              autoFocus
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Suchen..."
              className="w-full bg-slate-100 border-2 border-cyan-100 py-3 px-5 rounded-2xl focus:outline-none focus:border-cyan-600 text-sm"
            />
          </form>
        </div>
      )}
    </nav>
  );
}