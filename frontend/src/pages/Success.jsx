import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function Success() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const confirmOrder = async () => {
      if (orderId) {
        try {
          // 1. Dem Backend sagen, dass die Zahlung durch ist
          await api.post('/orders/confirm', { orderId });
          
          // 2. Warenkorb im Browser löschen
          localStorage.removeItem('cartItems');
          
          // 3. Navbar Badge & Cart-Logic aktualisieren
          window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
          console.error("Fehler bei der Bestätigung:", err);
        }
      }
    };

    confirmOrder();
  }, [orderId]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 bg-slate-50">
      <div className="max-w-xl w-full bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 text-center relative overflow-hidden">
        
        {/* Dekorativer Hintergrund-Effekt */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-50 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
          <div className="w-28 h-28 bg-green-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-xl shadow-green-200 animate-bounce">
            ✓
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
            Bestellung <span className="text-green-500 font-black">erfolgreich!</span>
          </h1>
          
          <div className="bg-slate-50 inline-block px-6 py-2 rounded-2xl mb-8 border border-slate-100">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Deine Order-Nummer</p>
            <span className="font-mono text-slate-900 font-black text-lg">
              #{orderId ? orderId.toUpperCase().slice(-8) : "N/A"}
            </span>
          </div>

          <p className="text-slate-500 mb-12 leading-relaxed font-medium max-w-sm mx-auto text-lg">
            Vielen Dank für dein Vertrauen. Dein Paket wird jetzt in Braunau mit Liebe vorbereitet. 📦✨
          </p>

          <div className="grid grid-cols-1 gap-4">
            <Link 
              to="/profile" 
              className="bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-cyan-500 transition-all shadow-xl active:scale-95"
            >
              Meine Bestellungen ansehen
            </Link>
            
            <Link 
              to="/" 
              className="text-slate-400 py-4 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors"
            >
              Zurück zum Shop
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">
              Eine Bestätigung wurde an deine E-Mail gesendet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}